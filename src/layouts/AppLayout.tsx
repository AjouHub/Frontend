import { Outlet } from 'react-router-dom';
import BottomTabBar from '../components/BottomTabBar';

const TABBAR_PX = 64;

export default function AppLayout() {
    return (
        <>
            {/* 모든 화면 컨텐츠 영역 (탭바에 가리지 않도록 하단 패딩) */}
            <div
                style={{
                    minHeight: '100dvh',
                    paddingBottom: `calc(${TABBAR_PX}px + env(safe-area-inset-bottom, 0px))`,
                }}
            >
                <Outlet />
            </div>
            <BottomTabBar />
        </>
    );
}
