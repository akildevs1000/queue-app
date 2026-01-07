import logo from '@/assets/logo.png'; // or "../assets/logo.png"

export default function AppLogo() {
    return (
        <>
            <div className="">
                <img src={logo} alt="Logo" className="h-8  object-contain" />
            </div>
        </>
    );
}
