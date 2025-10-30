import React, {useEffect} from "react";
import {notify} from "../../utils/notify";
import {appNavigate} from "../../utils/router";

export function LoginErrorPage() {

    useEffect(() => {
        notify.info('아주대학교 계정만 로그인 가능합니다.')
        appNavigate('/login');
    }, []);

    return (
        <></>
    );
}
