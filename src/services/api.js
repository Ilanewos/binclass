import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem("binclass_auth"));
  if (auth?.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const auth = JSON.parse(localStorage.getItem("binclass_auth"));

        const res = await axios.post(
          "http://localhost:5000/api/auth/refresh-token",
          { refreshToken: auth.refreshToken }
        );

        auth.accessToken = res.data.accessToken;
        localStorage.setItem("binclass_auth", JSON.stringify(auth));

        originalRequest.headers.Authorization =
          "Bearer " + res.data.accessToken;

        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem("binclass_auth");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

export const logout = async () => {
  const auth = JSON.parse(localStorage.getItem("binclass_auth"));

  if (auth?.refreshToken) {
    try {
      await api.post("/auth/logout", {
        refreshToken: auth.refreshToken,
      });
    } catch (err) {
      console.log("Logout error:", err);
    }
  }

  localStorage.removeItem("binclass_auth");
  window.location.href = "/";
};
