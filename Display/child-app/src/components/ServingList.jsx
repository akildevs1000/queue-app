
const ServingList = ({tokens = []}) => {

    return (
        <>
            <div className="p-6 border-b border-white/10">
                <h2
                    className="text-3xl font-medium tracking-wider text-center text-gray-300"
                >
                    Serving List
                </h2>
            </div>
            <div className="flex-1 overflow-hidden relative marquee-container">
                <div className="absolute inset-0">
                    <div className="animate-marquee">
                        {/* List of tokens (will need to be mapped in a real app) */}
                        {/* {} */}
                        <ul className="space-y-4 p-6 text-3xl font-light text-gray-200">
                            {
                                tokens.map((item) => (
                                    <li
                                        className="grid grid-cols-2 items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 border border-transparent hover:border-brand-cyan/20"
                                    >
                                        <span className="text-3xl">{item.token}</span>
                                        <span className="text-right text-[20px] text-gray-400">{item.counter}</span>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ServingList;