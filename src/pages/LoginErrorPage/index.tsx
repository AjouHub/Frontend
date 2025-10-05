import React, {useEffect} from "react";
import {notify} from "../../utils/notify";
import {appNavigate} from "../../utils/router";

export function LoginErrorPage() {

    useEffect(() => {
        notify.info('아주대 계정으로만 로그인하세요.')
        appNavigate('/login');
    }, []);

    return (
        <></>
    );
}
