import type * as monaco from "monaco-editor";
import * as vue_demi from "vue-demi";
import * as monaco_editor from "monaco-editor";
import type { IFile } from "~/types/folder.interface";
import { useColorMode } from "@vueuse/core";
import themeDark from "~/utils/theme-dark";
import themeLight from "~/utils/theme-light";

type Nullable<T> = T | null;
const mode = useColorMode();

export default function useEditor(
  monacoRef: vue_demi.ShallowRef<Nullable<typeof monaco_editor>>,
  files: IFile[],
  modelMap: Map<string, monaco.editor.ITextModel>,
  text: Ref<string>
) {
  const editorRef = shallowRef<monaco.editor.IStandaloneCodeEditor>();
  const content = shallowRef("");
  const activeFile = shallowRef<IFile>();
  const monacoInstance = shallowRef<Nullable<typeof monaco_editor>>(null);

  const { onAutoCompletion } = useAutoCompletion(text, content);
  const { symbols, extension } = storeToRefs(useEditorStore());
  const { onCollaboration } = useCollaboration();

  const onLoad = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.value = editor;
    monacoInstance.value = monacoRef.value;
    if (!monacoInstance.value) return;

    monacoInstance.value.editor!.defineTheme("theme-dark", themeDark);
    monacoInstance.value.editor!.defineTheme("theme-light", themeLight);
    monacoInstance.value.editor!.setTheme(
      mode.value === "light" ? "theme-light" : "theme-dark"
    );

    files = [...files].map((file) => {
      content.value = file.content;
      const uri = monacoInstance.value!.Uri.parse(
        `${file.name}.${file.extension}`
      );
      const model = monacoInstance.value!.editor.createModel(
        content.value,
        file.extension === "ts" ? "typescript" : "javascript",
        uri
      );
      extension.value = file.extension;

      modelMap.set(file.id, model);
      model.onDidChangeContent(() => {
        modelMap.set(
          file.id,
          editorRef.value!.getModel() as monaco.editor.ITextModel
        );
      });
      return {
        ...file,
      };
    });

    aiMenuConfig(monacoInstance.value);

    if (files.length === 1) {
      navigateTo(COMPILER_ABOUT_ROUTE);
    }

    onCollaboration(editorRef);
  };

  const switchTab = (to: IFile) => {
    activeFile.value = to;
    const activeModel = modelMap.get(to.id);

    if (activeModel) {
      editorRef.value?.setModel(activeModel);
      content.value = activeFile.value.content;
      onCollaboration(editorRef);
    }
  };

  const aiMenuConfig = (monaco: typeof monaco_editor) => {
    const aiAction: monaco.editor.IActionDescriptor = {
      id: "ai_helper",
      label: `✨ Xpiler AI Auto-Completion`,
      run: () => onAutoCompletion(),
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyQ],
    };
    monaco.editor.addEditorAction(aiAction);
  };

  watch(
    () => mode.value,
    () => {
      monacoRef.value?.editor!.defineTheme("theme-dark", themeDark);
      monacoRef.value?.editor!.defineTheme("theme-light", themeLight);
      monacoRef.value?.editor!.setTheme(
        mode.value === "light" ? "theme-light" : "theme-dark"
      );
    }
  );

  watch(
    () => content.value,
    () => {
      symbols.value = content.value;
    }
  );

  watch(
    () => activeFile.value,
    () => {
      extension.value = activeFile.value?.extension!;
    }
  );

  return {
    editorRef,
    onLoad,
    switchTab,
    activeFile,
    content,
    aiMenuConfig,
    monacoInstance,
  };
}
