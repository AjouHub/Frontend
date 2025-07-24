import NavigationButton from "../../components/NavigationButton";


export default function MyPage() {
    return (
        <div>
            <h2>마이페이지</h2> <br/>
            <NavigationButton to='/account-info'>계정 정보 페이지</NavigationButton>
        </div>
    );
}