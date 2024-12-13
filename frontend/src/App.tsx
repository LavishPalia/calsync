import { PropsWithChildren } from "react";
import { UserContextProvider } from "./contexts/UserContext";
import { EventProvider } from "./contexts/EventContext";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = ({ children }: PropsWithChildren) => {
  return (
    <UserContextProvider>
      <EventProvider>
        {children}

        <ToastContainer
          position="bottom-left"
          autoClose={2000}
          hideProgressBar
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
          transition={Slide}
        />
      </EventProvider>
    </UserContextProvider>
  );
};

export default App;
