import React, { Component } from "react";
import ReactDOM from "react-dom/client";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import AddPage from "./AddPage"; // ✅ Added import
import DetailPage from "./DetailPage";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import MainPageWithNavigate from "./MainPage";
import ReservationPage from "./ReservationPage";
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
                    <Route path="/reservations" element={<ReservationPage />} />
                    <Route path="/details/:type/:id" element={<DetailPage />} />
                    <Route path="/dodaj" element={<AddPage />} />
                </Routes>
            </Router>
        );
    }
}

const appDiv = document.getElementById("App");

if (appDiv) {
    const root = ReactDOM.createRoot(appDiv);
    root.render(<App />);
} else {
    console.error('Target container "#App" not found in the DOM.');
}
