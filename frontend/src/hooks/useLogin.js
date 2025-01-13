import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

const useLogin = () => {
	const [loading, setLoading] = useState(false);
	const { setAuthUser } = useAuthContext();

	const login = async (credentials) => {
		const { username, password, googleId, fullName, gender, profilePic } = credentials;

		if (googleId) {
			return await handleGoogleLogin({
				googleId,
				username,
				fullName,
				gender,
				profilePic
			});
		}

		const success = handleInputErrors(username, password);
		if (!success) return;

		setLoading(true);
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json();

			if (data.error) {
				throw new Error(data.error);
			}

			const userData = {
				_id: data._id,
				fullName: data.fullName,
				username: data.username,
				profilePic: data.profilePic,
				isAdmin: data.isAdmin
			};

			localStorage.setItem("chat-user", JSON.stringify(userData));
			setAuthUser(userData);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleLogin = async (googleData) => {
		setLoading(true);
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(googleData),
			});

			const data = await res.json();

			if (data.error) {
				throw new Error(data.error);
			}

			const userData = {
				_id: data._id,
				fullName: data.fullName,
				username: data.username,
				profilePic: data.profilePic,
				isAdmin: data.isAdmin
			};

			localStorage.setItem("chat-user", JSON.stringify(userData));
			setAuthUser(userData);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { loading, login };
};

export default useLogin;

function handleInputErrors(username, password) {
	if (!username || !password) {
		toast.error("Please fill in all fields");
		return false;
	}
	return true;
}