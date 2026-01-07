
"use client";

import { useState, useEffect } from "react";
import { getEvent, getCheckIns } from "@/lib/data";
import { useIsClient } from "@/hooks/use-is-client";
import type { CheckIn, EventDetails } from "@/lib/types";

export function useCheckInData() {
    const isClient = useIsClient();
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

    useEffect(() => {
        if (!isClient) return;

        const loadData = () => {
            setEvent(getEvent());
            setCheckIns(getCheckIns());
        };

        loadData();

        window.addEventListener("storage", loadData);
        return () => window.removeEventListener("storage", loadData);
    }, [isClient]);

    return {
        event,
        checkIns,
        isClient,
        isLoading: !isClient
    };
}
