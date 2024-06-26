import type { UserAuth, UserType } from "~/types/user.inteface";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<null | UserType>(null);
  const token = useCookie("token");
  const isLoading = ref(true);

  const { onGithubLogin, onLogin, getUser } = useAuth();

  const oAuth2Github = async () => {
    try {
      const response = await onGithubLogin();

      const creds = await onLogin({
        Gitid: response?.user.uid!,
        email: response?.user.email!,
        photoURL: response?.user.photoURL!
      });
      user.value = creds.data;
      token.value = creds.data.token;
    } catch (err: any) {
      console.log(err);
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await getUser();
      user.value = response.data;
    } catch (err) {
      console.log(err);
    }
  };

  setTimeout(() => {
    isLoading.value = false;
  }, 2000)

  const logout = () => {
    user.value = null;
    token.value = "";
    useFolderStore().dir.folders = []
    useFolderStore().dir.files = []
  };

  // watch(() => user.value, async () => { 
  //   useFolderStore().dir._id = user.value!.rootFolder;
  //   useFolderStore().dir.parentId = user.value!.rootFolder;
  // })

  // watch(() => user.value, async () => {
  //   await useFolderStore().getUserFolders();
  // })

  return {
    user,
    token,
    isLoading,
    oAuth2Github,
    getCurrentUser,
    logout
  };
});
