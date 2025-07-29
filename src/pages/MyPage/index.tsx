import NavigationButton from "../../components/NavigationButton";


export default function MyPage() {
    return (
        <div style={{ padding: '20px' }}>
            <h1>마이페이지</h1> <br/>
            <NavigationButton to='/account-info'>계정 정보 페이지</NavigationButton>
        </div>
    );
}