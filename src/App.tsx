import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, MouseEvent as ReactMouseEvent, MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, PerspectiveCamera, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const imagery = {
  heroTruck:
    'https://images.pexels.com/photos/12788115/pexels-photo-12788115.jpeg?auto=compress&cs=tinysrgb&fit=crop&fm=avif&q=72&h=1100&w=1800',
  containerYard:
    'https://images.pexels.com/photos/7519246/pexels-photo-7519246.jpeg?auto=compress&cs=tinysrgb&fit=crop&fm=avif&q=72&h=1050&w=1700',
  shipPort:
    'https://images.pexels.com/photos/26224664/pexels-photo-26224664.jpeg?auto=compress&cs=tinysrgb&fit=crop&fm=avif&q=72&h=1050&w=1700',
  portNight:
    'https://images.pexels.com/photos/15348180/pexels-photo-15348180.jpeg?auto=compress&cs=tinysrgb&fit=crop&fm=avif&q=72&h=1050&w=1700',
  warehouse:
    'https://images.pexels.com/photos/1267327/pexels-photo-1267327.jpeg?auto=compress&cs=tinysrgb&fit=crop&fm=avif&q=72&h=1050&w=1700',
  airplane:
    'https://images.pexels.com/photos/30030222/pexels-photo-30030222.jpeg?auto=compress&cs=tinysrgb&fit=crop&fm=avif&q=72&h=1050&w=1700',
};

type RouteMeta = {
  origin: string;
  destination: string;
  cargo: string;
  transit: string;
  status: string;
};

const shipmentSamples: Record<string, RouteMeta & { eta: string; location: string }> = {
  ARH2401: {
    origin: 'Singapore',
    destination: 'Rotterdam',
    cargo: 'Semiconductor Tooling',
    transit: 'Suez Corridor',
    status: 'Ocean Freight Active',
    eta: '18 OCT 2026',
    location: 'Arabian Sea',
  },
  ARH7719: {
    origin: 'Mumbai',
    destination: 'Nairobi',
    cargo: 'Pharmaceutical Inputs',
    transit: 'Mombasa Port',
    status: 'Awaiting Final Dispatch',
    eta: '22 OCT 2026',
    location: 'Mombasa Customs Yard',
  },
};

function useDesktop() {
  const [desktop, setDesktop] = useState(() => window.innerWidth >= 960);

  useEffect(() => {
    const onResize = () => setDesktop(window.innerWidth >= 960);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return desktop;
}

function LoadingScreen({ done }: { done: boolean }) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (done) return;
    const timer = window.setInterval(() => {
      setStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 220);
    return () => window.clearInterval(timer);
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.85, ease: 'easeInOut' } }}
        >
          <p className="text-xs tracking-[0.35em] text-[#d8cfbf]/75">ARROWHEAD</p>
          <h1 className="mt-2 text-sm tracking-[0.26em] text-[#efe7d6]">CONNECTING TRADE ROUTES</h1>
          <div className="mt-8 w-[320px] max-w-[82vw] space-y-3 text-[11px] tracking-[0.2em] text-[#d8cfbf]/80">
            <p className={step >= 1 ? 'opacity-100' : 'opacity-30'}>LOADING 01 - GLOBAL NETWORK</p>
            <p className={step >= 2 ? 'opacity-100' : 'opacity-30'}>LOADING 02 - CARGO SYSTEM</p>
            <p className={step >= 3 ? 'opacity-100' : 'opacity-30'}>LOADING 03 - TRANSPORT NETWORK</p>
            <div className="h-px bg-[#ffffff22]">
              <motion.div
                className="h-full bg-[#dcc48c]"
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PremiumCursor() {
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [active, setActive] = useState(false);
  const [label, setLabel] = useState('');

  useEffect(() => {
    const move = (event: MouseEvent) => setPosition({ x: event.clientX, y: event.clientY });
    const enter = (event: Event) => {
      const el = event.target as HTMLElement;
      const marker = el.closest('[data-cursor]');
      if (!marker) return;
      setActive(true);
      setLabel(marker.getAttribute('data-cursor') || 'OPEN');
    };
    const leave = (event: Event) => {
      const el = event.target as HTMLElement;
      if (!el.closest('[data-cursor]')) return;
      setActive(false);
      setLabel('');
    };

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseover', enter);
    document.addEventListener('mouseout', leave);

    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', enter);
      document.removeEventListener('mouseout', leave);
    };
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[110] mix-blend-screen"
      animate={{ x: position.x - (active ? 42 : 10), y: position.y - (active ? 42 : 10) }}
      transition={{ type: 'spring', damping: 28, stiffness: 380, mass: 0.45 }}
    >
      <motion.div
        className="flex items-center justify-center rounded-full border border-[#efe7d4]/70 bg-[#efe7d4]/10 backdrop-blur-md"
        animate={{ width: active ? 84 : 20, height: active ? 84 : 20 }}
      >
        <motion.span className="text-[9px] tracking-[0.2em] text-[#f3ebdb]" animate={{ opacity: active ? 1 : 0 }}>
          {label}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

function MagneticButton({ children }: { children: string }) {
  const ref = useRef<HTMLButtonElement | null>(null);

  const onMove = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const bounds = ref.current.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    gsap.to(ref.current, { x: x * 0.18, y: y * 0.18, duration: 0.35, ease: 'power3.out' });
  };

  const onLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.4, ease: 'power3.out' });
  };

  return (
    <button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      data-cursor="ENTER"
      className="group relative overflow-hidden border border-[#efe7d0]/40 px-7 py-3 text-xs tracking-[0.2em] text-[#efe7d0]"
    >
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
        <span className="transition-transform duration-300 group-hover:translate-x-1">{'->'}</span>
      </span>
      <span className="absolute inset-0 -z-0 origin-left scale-x-0 bg-[#dcc48c]/20 transition-transform duration-500 group-hover:scale-x-100" />
    </button>
  );
}

function latLongToVector3(lat: number, lon: number, r = 2.35) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-(r * Math.sin(phi) * Math.cos(theta)), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function GlobeScene({ active, spinRef }: { active: number; spinRef: MutableRefObject<number> }) {
  const globe = useRef<THREE.Mesh | null>(null);
  const clouds = useRef<THREE.Mesh | null>(null);
  const movers = useRef<(THREE.Mesh | null)[]>([]);
  const [earthMap, cloudMap] = useTexture([
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r165/examples/textures/planets/earth_atmos_2048.jpg',
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r165/examples/textures/planets/earth_clouds_1024.png',
  ]);

  useEffect(() => {
    earthMap.colorSpace = THREE.SRGBColorSpace;
    cloudMap.colorSpace = THREE.SRGBColorSpace;
  }, [earthMap, cloudMap]);
  const coords = useMemo(
    () => [
      [19.076, 72.8777],
      [25.2048, 55.2708],
      [51.9244, 4.4777],
      [1.3521, 103.8198],
      [51.5072, -0.1276],
      [31.2304, 121.4737],
    ],
    [],
  );

  const curves = useMemo(() => {
    const links: [number, number][] = [
      [0, 1],
      [1, 2],
      [3, 0],
      [0, 4],
      [5, 1],
      [1, 4],
    ];

    return links.map(([a, b]) => {
      const from = latLongToVector3(coords[a][0], coords[a][1]);
      const to = latLongToVector3(coords[b][0], coords[b][1]);
      const mid = from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(3);
      return new THREE.CatmullRomCurve3([from, mid, to]);
    });
  }, [coords]);

  useFrame(({ pointer, clock, camera }) => {
    if (globe.current) {
      globe.current.rotation.y = spinRef.current * Math.PI * 2;
      globe.current.rotation.x = THREE.MathUtils.lerp(globe.current.rotation.x, pointer.y * 0.16, 0.03);
    }
    if (clouds.current) {
      clouds.current.rotation.y = spinRef.current * Math.PI * 2 + clock.elapsedTime * 0.02;
      clouds.current.rotation.x = globe.current?.rotation.x || 0;
    }

    curves.forEach((curve, index) => {
      const dot = movers.current[index];
      if (!dot) return;
      dot.position.copy(curve.getPoint((clock.elapsedTime * 0.08 + index * 0.16) % 1));
    });

    camera.position.lerp(new THREE.Vector3(pointer.x * 0.6, pointer.y * 0.4, 8.2), 0.03);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8.2]} fov={34} />
      <ambientLight intensity={0.22} />
      <pointLight position={[6, 3, 4]} intensity={1.1} color="#d8ba86" />
      <pointLight position={[-6, -3, -4]} intensity={0.5} color="#6b9ff5" />
      <mesh ref={globe}>
        <sphereGeometry args={[2.45, 96, 96]} />
        <meshPhongMaterial
          map={earthMap}
          specular="#36506b"
          shininess={12}
        />
      </mesh>
      <mesh ref={clouds}>
        <sphereGeometry args={[2.49, 64, 64]} />
        <meshStandardMaterial map={cloudMap} transparent opacity={0.25} depthWrite={false} />
      </mesh>
      {curves.map((curve, index) => (
        <group key={index}>
          <Line points={curve.getPoints(80)} color={active === index % 3 ? '#f3d79f' : '#8cb3ef'} transparent opacity={0.64} />
          <mesh ref={(el) => (movers.current[index] = el)}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshBasicMaterial color="#ffdfa1" />
          </mesh>
        </group>
      ))}
      <mesh>
        <sphereGeometry args={[2.55, 64, 64]} />
        <meshBasicMaterial color="#7eaef8" transparent opacity={0.05} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.63, 64, 64]} />
        <meshBasicMaterial color="#8eb5ff" transparent opacity={0.08} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  );
}

function GlobeFallback() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8.2]} fov={34} />
      <ambientLight intensity={0.2} />
      <pointLight position={[6, 3, 4]} intensity={0.6} color="#d8ba86" />
      <mesh>
        <sphereGeometry args={[2.45, 48, 48]} />
        <meshStandardMaterial color="#16202b" metalness={0.4} roughness={0.45} />
      </mesh>
    </>
  );
}

function CountUp({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.65 });
  const numeric = Number.parseInt(value, 10);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const duration = 1000;
    const update = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(numeric * progress));
      if (progress < 1) window.requestAnimationFrame(update);
    };
    window.requestAnimationFrame(update);
  }, [inView, numeric]);

  return (
    <div ref={ref}>
      <p className="text-5xl font-semibold tracking-tight text-[#efe7d8] md:text-7xl">
        {display}
        {value.includes('+') ? '+' : value.includes('%') ? '%' : ''}
      </p>
      <p className="mt-2 text-[11px] tracking-[0.2em] text-[#d6cebe]/75">{label}</p>
    </div>
  );
}

function App() {
  const desktop = useDesktop();
  const [loaded, setLoaded] = useState(false);
  const [activeRoute] = useState(0);
  const [shipmentId, setShipmentId] = useState('ARH2401');
  const [shipment, setShipment] = useState(shipmentSamples.ARH2401);
  const journeyWrapperRef = useRef<HTMLElement | null>(null);
  const journeyTrackRef = useRef<HTMLDivElement | null>(null);
  const globeWrapperRef = useRef<HTMLElement | null>(null);
  const globeSpinRef = useRef(0);
  const [globeVisible, setGlobeVisible] = useState(false);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 70, damping: 24, mass: 0.5 });
  const smoothY = useSpring(pointerY, { stiffness: 70, damping: 24, mass: 0.5 });
  const heroX = useTransform(smoothX, (v) => v * -22);
  const heroY = useTransform(smoothY, (v) => v * -15);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 550);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!globeWrapperRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setGlobeVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '1200px 0px' },
    );

    observer.observe(globeWrapperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      pointerX.set((event.clientX / window.innerWidth - 0.5) * 2);
      pointerY.set((event.clientY / window.innerHeight - 0.5) * 2);
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [pointerX, pointerY]);

  // Horizontal "journey" reveal. Instead of asking GSAP to fabricate a pin
  // (which injects a spacer element and toggles position:fixed/static —
  // the exact mechanism that was producing the blank gap + repeated frame),
  // the sticky behaviour is delegated to plain CSS `position: sticky` on the
  // inner viewport-sized panel below. ScrollTrigger's only job here is to
  // read scroll progress across the tall wrapper and drive the horizontal
  // translateX of the track — no pin, no spacer, nothing to desync.
  useEffect(() => {
    if (!journeyWrapperRef.current || !journeyTrackRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(journeyTrackRef.current, {
        xPercent: -83.333,
        ease: 'none',
        scrollTrigger: {
          trigger: journeyWrapperRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  // Same sticky-driven pattern for the globe: the canvas sits in a sticky
  // viewport-height panel, and scroll progress across the tall wrapper just
  // drives the spin value — nothing is pinned by JS.
  useEffect(() => {
    if (!globeWrapperRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: globeWrapperRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          globeSpinRef.current = self.progress;
        },
      });
    });

    return () => ctx.revert();
  }, []);

  const handleTrack = (event: FormEvent) => {
    event.preventDefault();
    const found = shipmentSamples[shipmentId.toUpperCase()];
    if (found) {
      setShipment(found);
      return;
    }
    setShipment({
      origin: 'Shenzhen',
      destination: 'Doha',
      cargo: 'Electromechanical Assemblies',
      transit: 'Colombo Relay',
      status: 'Manifest Received',
      eta: '26 OCT 2026',
      location: 'South China Sea',
    });
  };

  return (
    <div className="bg-[#07090b] text-[#efe7d7]">
      {desktop && <PremiumCursor />}
      <LoadingScreen done={loaded} />
      <div className="grain-overlay" />

      <section className="relative h-screen overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            x: heroX,
            y: heroY,
            scale: 1.04,
            backgroundImage: `url(${imagery.heroTruck})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(3,5,8,0.88),rgba(7,9,11,0.45),rgba(7,9,11,0.85))]" />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-6 md:px-12">
          <p className="mb-5 text-xs tracking-[0.36em] text-[#d8d0c2]/75">ARROWHEAD INTERNATIONAL LOGISTICS</p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-[0.07em] text-[#f3ead8] md:text-7xl">TRADE WITHOUT BORDERS.</h1>
          <p className="mt-5 max-w-xl text-sm tracking-[0.14em] text-[#d8d0bf]/85 md:text-base">
            Moving products. Connecting markets. Delivering opportunity.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <MagneticButton>EXPLORE OUR NETWORK</MagneticButton>
            <MagneticButton>GET IN TOUCH</MagneticButton>
          </div>
        </div>
      </section>

      <section ref={globeWrapperRef} className="relative" style={{ height: '220vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden border-y border-[#f0e7d1]/10">
          <div className="absolute inset-0">
            {desktop && globeVisible ? (
              <Canvas dpr={[1, 2]}>
                <Suspense fallback={<GlobeFallback />}>
                  <GlobeScene active={activeRoute} spinRef={globeSpinRef} />
                </Suspense>
              </Canvas>
            ) : (
              <div className="h-full bg-[radial-gradient(circle_at_center,#1b2531_0%,#0a0d11_70%)]" />
            )}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(7,9,11,0.78)_100%)]" />
        </div>
      </section>

      <section ref={journeyWrapperRef} className="relative" style={{ height: '300vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden border-y border-[#f0e7d1]/10">
          <div ref={journeyTrackRef} className="absolute left-0 top-0 flex h-full w-[600vw]">
            {[
              { stage: 'SOURCE', image: imagery.airplane },
              { stage: 'WAREHOUSE', image: imagery.warehouse },
              { stage: 'PORT', image: imagery.containerYard },
              { stage: 'SHIP', image: imagery.shipPort },
              { stage: 'CUSTOMS', image: imagery.portNight },
              { stage: 'DESTINATION', image: imagery.heroTruck },
            ].map((item, index) => (
              <div
                key={item.stage}
                className="relative flex h-full w-screen flex-col justify-end px-8 pb-16 md:px-16"
                style={{
                  backgroundImage: `linear-gradient(110deg, rgba(3,5,8,0.88), rgba(3,5,8,0.35)), url(${item.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <p className="text-xs tracking-[0.28em] text-[#d7cebe]/70">0{index + 1}</p>
                <h3 className="mt-3 text-5xl tracking-[0.07em] md:text-7xl">{item.stage}</h3>
                <p className="mt-4 max-w-md text-sm tracking-[0.1em] text-[#d0c8b8]/78">
                  Chain-of-custody visibility synchronized across each transport and compliance checkpoint.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-10 md:px-12 md:py-14">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs tracking-[0.28em] text-[#d4cebf]/65">SERVICES</p>
          <h2 className="mt-4 max-w-3xl text-4xl tracking-[0.06em]">Integrated Import / Export Operating System</h2>
          <div className="mt-10 grid gap-px bg-[#f0e7d1]/15">
            {[
              { name: 'IMPORT', image: imagery.shipPort },
              { name: 'EXPORT', image: imagery.heroTruck },
              { name: 'GLOBAL LOGISTICS', image: imagery.portNight },
              { name: 'WAREHOUSING', image: imagery.warehouse },
              { name: 'LAST MILE DELIVERY', image: imagery.containerYard },
            ].map((service, index) => (
              <motion.div
                key={service.name}
                data-cursor="DETAIL"
                className="group relative min-h-[148px] overflow-hidden"
                whileHover={{ scale: 1.01 }}
              >
                <img
                  src={service.image}
                  alt={service.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(5,7,10,0.86),rgba(5,7,10,0.32),rgba(5,7,10,0.9))]" />
                <div className="relative z-10 grid h-full grid-cols-[70px_1fr] items-center px-6">
                  <p className="text-sm tracking-[0.2em] text-[#d9d1c2]/70">0{index + 1}</p>
                  <div>
                    <p className="text-2xl tracking-[0.08em]">{service.name}</p>
                    <p className="mt-2 text-sm tracking-[0.06em] text-[#cfc8b8]/75">Dedicated operators, route intelligence, and customs precision built around your cargo profile.</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-24 md:px-12">
        <img src={imagery.portNight} alt="Night port backdrop" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-[0.18]" />
        <div className="absolute inset-0 bg-[#07090bcc]" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-10 md:grid-cols-4">
          <CountUp value="25+" label="COUNTRIES" />
          <CountUp value="120+" label="TRADE ROUTES" />
          <CountUp value="10K+" label="SHIPMENTS" />
          <CountUp value="99%" label="DELIVERY RELIABILITY" />
        </div>
      </section>

      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs tracking-[0.26em] text-[#d4cebe]/65">SHIPMENT TRACKING</p>
            <h2 className="mt-4 text-5xl tracking-[0.07em]">KNOW WHERE IT IS.</h2>
            <p className="mt-4 max-w-md text-sm tracking-[0.08em] text-[#cfc8b8]/75">Track every handoff from source to destination with live milestone intelligence.</p>
            <form onSubmit={handleTrack} className="mt-8 flex gap-3">
              <input
                value={shipmentId}
                onChange={(event) => setShipmentId(event.target.value)}
                placeholder="ENTER SHIPMENT ID"
                className="w-full border border-[#f0e7d1]/30 bg-[#0d1117] px-4 py-3 text-xs tracking-[0.18em] outline-none placeholder:text-[#cfc8b8]/45 focus:border-[#e2c688]"
              />
              <button className="border border-[#e2c688] px-6 text-xs tracking-[0.18em] text-[#ead9ae]" data-cursor="SCAN">
                TRACK
              </button>
            </form>
          </div>
          <div className="border border-[#f0e7d1]/20 bg-[#0d1218] p-6 text-xs tracking-[0.16em] text-[#e9e1d2]">
            <motion.div key={shipment.location} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <p>CURRENT LOCATION: {shipment.location}</p>
              <p className="mt-3">STATUS: {shipment.status}</p>
              <p className="mt-3">ORIGIN: {shipment.origin}</p>
              <p className="mt-3">DESTINATION: {shipment.destination}</p>
              <p className="mt-3">TRANSIT: {shipment.transit}</p>
              <p className="mt-3">ESTIMATED ARRIVAL: {shipment.eta}</p>
              <div className="mt-6 h-px bg-[#ffffff22]">
                <motion.div
                  className="h-full bg-[#dcbc85]"
                  initial={{ width: '14%' }}
                  animate={{ width: ['22%', '68%', '86%'] }}
                  transition={{ duration: 2.2, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="relative overflow-hidden border-t border-[#f0e7d1]/10 px-6 py-24 md:px-12">
        <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_20%_20%,rgba(116,144,184,0.15),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(220,196,140,0.12),transparent_44%)]" />
        <div className="relative mx-auto max-w-7xl">
          <h2 className="max-w-4xl text-4xl tracking-[0.06em] text-[#f2e8d5] md:text-6xl">
            WHEREVER BUSINESS GOES,
            <br />
            WE MOVE WITH IT.
          </h2>
          <div className="mt-14 grid gap-8 text-xs tracking-[0.18em] text-[#d4cdbd]/80 md:grid-cols-4">
            <div className="space-y-3">
              <p>COMPANY</p>
              <p>SERVICES</p>
              <p>GLOBAL NETWORK</p>
              <p>TRACKING</p>
              <p>CONTACT</p>
            </div>
            <div className="space-y-3">
              <p>LINKEDIN</p>
              <p>INSTAGRAM</p>
              <p>YOUTUBE</p>
            </div>
            <div className="space-y-3">
              <p>DUBAI, UAE</p>
              <p>ROTTERDAM, NL</p>
              <p>SINGAPORE</p>
            </div>
            <div className="space-y-3">
              <p>HELLO@ARROWHEADGLOBAL.COM</p>
              <p>+971 4 500 8800</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;