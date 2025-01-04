import React, { Component } from "react";
import ReactDOM from "react-dom/client"; // Correct import for React 18+
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"; // Import routing components
import HomePage from "./HomePage"; // Assuming HomePage is your landing page
import LoginPage from "./LoginPage"; // Import LoginPage
import { MainPageWithNavigate } from "./MainPage";
import SignUpPage from "./SignUpPage"; // Import SignUpPage

export default class App extends Component {
    render() {
        return (
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} /> {/* Home Page Route */}
                    <Route path="/login" element={<LoginPage />} /> {/* Login Page Route */}
                    <Route path="/signup" element={<SignUpPage />} /> {/* SignUp Page Route */}
                    <Route path="/main" element={<MainPageWithNavigate />} /> {/* Main Page Route */}
                    <Route exact path="/" element={<HomePage />} /> {/* Main Page Route */}
                </Routes>
            </Router>
        );
    }
}

const appDiv = document.getElementById("app");
const root = ReactDOM.createRoot(appDiv);  // Using createRoot in React 18+
root.render(<App />);  // Rendering with