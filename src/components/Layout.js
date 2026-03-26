import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ParticlesBg from "./ParticlesBg";

function Layout({ children }) {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/background01.jpg')" }}
    >
      <ParticlesBg />

      <div className="min-h-screen bg-white/50 dark:bg-black/75 flex flex-col">
        <Header />
        <Navbar />

        <main className="flex-1 px-4 py-8">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default Layout;