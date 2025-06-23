// pages/_app.js
import '../styles/auth.css'; // Global styles
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
