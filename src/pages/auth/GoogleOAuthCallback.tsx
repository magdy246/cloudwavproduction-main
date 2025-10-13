import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner/Spinner";

function GoogleOAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Function to parse and process OAuth response
    // 1. Create a URL object from the current location
    const currentUrl = new URL(window.location.href);

    // 2. Get its search parameters
    const params = currentUrl.searchParams;

    // 3. Extract each value by its key
    const message = params.get("message"); // "Logged in successfully"
    const accessToken = params.get("access_token"); // your JWT
    const refreshToken = params.get("refresh_token"); // your refresh token
    const expiresIn = Number(params.get("expires_in")); // 900
    const tokenType = params.get("token_type"); // "Bearer"
    const userId = params.get("id"); // "13"
    const name = params.get("name"); // "Amr Abdo"
    const email = params.get("email"); // "andkpe12@gmail.com"
    const googleId = params.get("google_id"); // "100299543450796542190"

    // 4. (Optional) Bundle them into an object for easy use
    const authData = {
      message,
      accessToken,
      refreshToken,
      expiresIn,
      tokenType,
      userId,
      name,
      email,
      googleId,
    };

    console.log(authData);
    localStorage.setItem(
      "access",
      `${authData.tokenType} ${authData.accessToken}`
    );

    if (authData.refreshToken) {
      localStorage.setItem("refresh_token", authData.refreshToken);
    }
    localStorage.setItem("user", JSON.stringify(authData));

    setTimeout(() => {
      navigate("/");
    }, 2000);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner />
        <p className="mt-4 text-gray-600">Processing your login...</p>
      </div>
    </div>
  );
}

export default GoogleOAuthCallback;
