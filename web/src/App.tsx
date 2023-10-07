import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const { loginWithRedirect, isAuthenticated, logout, getAccessTokenSilently } =
    useAuth0();

  const showApiCall = () => {
    getAccessTokenSilently().then((token) => {
      fetch("http://localhost:3001/api/v1/test", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => alert(data.message));
    });
  };
  console.log("Authenticated?: ", isAuthenticated);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-background font-go text-secondary">
      <div>
        {isAuthenticated ? (
          <>
            <button
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
            >
              logout
            </button>
            <button onClick={() => showApiCall()}>show api call</button>
          </>
        ) : (
          <button
            className="bg-foreground px-7 py-3 rounded-lg"
            onClick={() => loginWithRedirect()}
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
