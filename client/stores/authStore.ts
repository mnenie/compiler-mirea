import type { UserAuth, UserType } from "~/types/user.inteface";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<null | UserType>(null);
  const token = useCookie("token");
  const isLoading = ref(false);

  const { onGithubLogin, onLogin, getUser } = useAuth();

  const oAuth2Github = async () => {
    try {
      const response = await onGithubLogin();
      user.value = {
        Gitid: response?.user.uid!,
        email: response?.user.email!,
        photoURL: response?.user.photoURL!,
      };
      const creds = await onLogin({
        Gitid: user.value.Gitid,
        email: user.value.email,
        photoURL: user.value.photoURL!,
      });

      token.value = creds.data.token;
    } catch (err: any) {
      throw new Error(err);
    }
  };

  const getCurrentUser = async () => {
    isLoading.value = true;
    try {
      const response = await getUser();
      user.value = response.data;
      isLoading.value = false;
    } catch (err) {
      console.log(err);
    }
  };

  const logout = () => {
    user.value = null;
    token.value = "";
  };

  return {
    user,
    token,
    isLoading,
    oAuth2Github,
    getCurrentUser,
    logout
  };
});