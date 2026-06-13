import './App.css'
import { auth } from './firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";

function App() {
  const register = async () => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        "test@example.com",
        "password123"
      );

      console.log(result.user);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button onClick={register}>
      Create Test User
    </button>
  );
}

export default App
