import React, { Component } from "react";
import ReactDOM from "react-dom/client";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import { MainPageWithNavigate } from "./MainPage";
import SignUpPage from "./SignUpPage";

export default class App extends Component {
    render() {
        return (
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/main" element={<MainPageWithNavigate />} />
                </Routes>
            </Router>
        );
    }
}

const appDiv = document.getElementById("App");

if (appDiv) {
    const root = ReactDOM.createRoot(appDiv); // Only call createRoot if the element exists
    root.render(<App />);
} else {
    console.error('Target container "#App" not found in the DOM.');
}