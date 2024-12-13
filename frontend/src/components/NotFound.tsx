import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div>
      <p>404 Page Not Found</p>
      <button
        onClick={() => {
          navigate("/login");
        }}
      >
        Back to Login
      </button>
    </div>
  );
};

export default NotFound;
