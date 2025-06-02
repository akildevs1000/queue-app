import { useState } from 'react';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { GradientButton } from '@/components/ui/GradientButton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProductSlider from '@/components/Slider'; // Adjust path if needed


export default function Welcome() {
    const { auth, products } = usePage<SharedData>().props;
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const [cart, setCart] = useState<any[]>([]);

    const closeModal = () => setSelectedImage(null);

    // Add to Cart Function
    const addToCart = (product: any) => {
        setCart((prevCart) => {
            const existingProduct = prevCart.find((item) => item.id === product.id);
            if (existingProduct) {
                return prevCart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };

    // Remove from Cart Function
    const removeFromCart = (productId: number) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    // Cart item increment function
    const incrementQuantity = (productId: number) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    // Cart item decrement function
    const decrementQuantity = (productId: number) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === productId && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    };

    return (
        <>
            <Head title="Welcome">
                {/* <link rel="preconnect" href="https://fonts.bunny.net" /> */}
                {/* <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" /> */}
            </Head>

          

            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] text-[#1b1b18] lg:justify-center pt-6 dark:bg-[#0a0a0a]">
                {/* Header */}

                <div className='max-w-7xl w-full mx-auto mb-6'>
                    <header className="">
                        <nav className="flex justify-between items-center px-4">
                            <Link
                                href="/"
                                className="text-xl font-bold text-[#1b1b18] dark:text-[#EDEDEC] hover:text-[#4CAF50]"
                            >
                                Home
                            </Link>
                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="text-sm text-[#1b1b18] dark:text-[#EDEDEC] hover:text-[#4CAF50]"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="text-sm text-[#1b1b18] dark:text-[#EDEDEC] hover:text-[#4CAF50]"
                                        >
                                            Log in
                                        </Link>
                                        {/* <Link
                                            href={route('register')}
                                            className="text-sm text-[#1b1b18] dark:text-[#EDEDEC] hover:text-[#4CAF50]"
                                        >
                                            Register
                                        </Link> */}
                                    </>
                                )}
                                {/* Cart Icon */}
                                {/* <button
                                    className="relative"
                                    onClick={() => alert('Viewing Cart')}
                                >
                                    <span className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                        Cart ({cart.length})
                                    </span>
                                </button> */}
                            </div>
                        </nav>
                    </header>

                    <ProductSlider
                        products={products}
                        onImageClick={(image) => setSelectedImage(image)}
                    />

                    {/* Products Section */}
                    <section className='mt-15'>
                        <h6 className="text-2xl text-gray-800 dark:text-gray-100 px-5">Latest Products</h6>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

                            {products?.map(product => (
                                <Card key={product.id}>
                                    <CardContent className="p2">
                                        <div className="overflow-hidden cursor-pointer" onClick={() => setSelectedImage(product.image)}>
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        <h2 className="text-xl font-semibold">{product.name}</h2>
                                        <div className="mt-2 flex justify-between ">
                                            <span className='font-bold'>{product.price} AED</span>
                                            <small>By {product?.user?.name}</small>
                                        </div>
                                        <GradientButton className="mt-4 w-full" onClick={() => addToCart(product)}>Add to Bucket</GradientButton>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>


                    </section>


                    {cart.length > 0 && (
                        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 border-t border-gray-200 z-50">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-lg font-bold text-gray-800">Your Cart</h2>
                                <button
                                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                                    onClick={() => setCart([])}
                                >
                                    Clear Cart
                                </button>
                            </div>
                            <ul className="space-y-4 max-h-60 overflow-y-auto">
                                {cart.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex justify-between items-center border rounded-md p-3 shadow-sm"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{item.name}</span>
                                            <span className="text-sm text-gray-500">Quantity: {item.quantity}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => decrementQuantity(item.id)}
                                                className="w-8 h-8 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full text-center"
                                            >
                                                -
                                            </button>
                                            <button
                                                onClick={() => incrementQuantity(item.id)}
                                                className="w-8 h-8 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full text-center"
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-sm text-red-500 hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>



            </div>
        </>
    );
}
