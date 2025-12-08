import { useState, useEffect } from "react";
import { TEST_MODE_END_DATE } from "../config/appConfig";

export const useTestMode = () => {
    const [isTestModeAvailable, setIsTestModeAvailable] = useState(false);
    
    useEffect(() => {
        const checkDate = () => {
            const now = new Date();
            const endDate = new Date(TEST_MODE_END_DATE);
            setIsTestModeAvailable(now < endDate);
        };
        checkDate();
        // Optional: Check every minute if you want real-time expiration handling
    }, []);

    return { isTestModeAvailable };
};
