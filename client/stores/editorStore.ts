import { defineStore } from "pinia";
import type { IFile } from "@/types/folder.interface";
import type * as monaco from "monaco-editor";
import { aboutFile } from "~/mocks/about.mock";

export const useEditorStore = defineStore("editor", () => {
  const activeTabs = ref<IFile[]>([] as IFile[]);
  const modelMap = new Map<string, monaco.editor.ITextModel>();

  const toggleFile = (file: IFile) => {
    const index = activeTabs.value.findIndex((f) => f.id === file.id);
    if (index === -1) {
      if (activeTabs.value.length > 1) {
        const prevFile = activeTabs.value[activeTabs.value.length - 1];
        removeFile(prevFile.id);
      }
      activeTabs.value.push(file);
      navigateTo(COMPILER_ROUTE + '/' + file.id);
    }
  };

  const removeFile = (id: string) => {
    activeTabs.value = activeTabs.value.filter((f) => f.id !== id);
    if(activeTabs.value.length === 1){
      navigateTo(COMPILER_ROUTE + '/' + 'about_compiler')
    }
  };

  onMounted(() => {
    activeTabs.value.unshift(aboutFile)
  })

  return {
    activeTabs,
    // methods
    toggleFile,
    removeFile,
  };
});