import "tailwindcss/tailwind.css"; //tailwindcssのスタイルを読み込む

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
