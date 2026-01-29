import React, { StrictMode, useRef, useState } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";

function CreepyButton({ children }) {
    const eyesRef = useRef(null);
    const [eyeCoords, setEyeCoords] = useState({ x: 0, y: 0 });

    const updateEyes = (e) => {
        const userEvent = e.touches ? e.touches[0] : e;
        const eyesRect = eyesRef.current?.getBoundingClientRect();
        
        if (!eyesRect) return;

        const eyesCenter = {
            x: eyesRect.left + eyesRect.width / 2,
            y: eyesRect.top + eyesRect.height / 2
        };

        const dx = userEvent.clientX - eyesCenter.x;
        const dy = userEvent.clientY - eyesCenter.y;
        
        const angle = Math.atan2(dy, dx);
        const distance = Math.min(Math.hypot(dx, dy) / 10, 30);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        setEyeCoords({ x, y });
    };

    const eyeStyle = {
        transform: `translate(calc(-50% + ${eyeCoords.x}px), calc(-50% + ${eyeCoords.y}px))`
    };

    return React.createElement("button", { 
        className: "creepy-btn", 
        onMouseMove: updateEyes, 
        onTouchMove: updateEyes 
    },
        React.createElement("span", { className: "creepy-btn__eyes", ref: eyesRef },
            React.createElement("span", { className: "creepy-btn__eye" },
                React.createElement("span", { className: "creepy-btn__pupil", style: eyeStyle })),
            React.createElement("span", { className: "creepy-btn__eye" },
                React.createElement("span", { className: "creepy-btn__pupil", style: eyeStyle }))
        ),
        React.createElement("span", { className: "creepy-btn__cover" }, children)
    );
}

const root = createRoot(document.getElementById("root"));
root.render(
    React.createElement(StrictMode, null, 
        // Cambia la stringa qui sotto con quella che preferisci
        React.createElement(CreepyButton, null, "Premi qui!")
    )
);