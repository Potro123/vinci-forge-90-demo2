import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, PresentationControls, Environment, Grid } from '@react-three/drei';
import { Suspense, Component, ReactNode, useState, useEffect, useRef } from 'react';
import { Package, Loader2 } from 'lucide-react';
import { posterCache, getPosterCacheKey } from '@/lib/posterCache';
import * as THREE from 'three';

interface UnityTransform {
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
}

interface ThreeDThumbnailProps {
  modelUrl: string;
  jobId?: string;
  userId?: string;
  unityTransform?: UnityTransform;
  isUnityModel?: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ModelErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('3D Thumbnail loading error:', error);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

function Model({ url, unityTransform, isUnityModel }: { url: string; unityTransform?: UnityTransform; isUnityModel?: boolean }) {
  const gltf = useGLTF(url);
  
  if (!gltf?.scene) {
    console.error('No scene in GLTF:', gltf);
    return null;
  }

  useEffect(() => {
    if (gltf.scene && isUnityModel && unityTransform) {
      gltf.scene.position.set(unityTransform.positionX, unityTransform.positionY, unityTransform.positionZ);
      gltf.scene.rotation.set(
        THREE.MathUtils.degToRad(unityTransform.rotationX),
        THREE.MathUtils.degToRad(unityTransform.rotationY),
        THREE.MathUtils.degToRad(unityTransform.rotationZ)
      );
      gltf.scene.scale.set(unityTransform.scaleX, unityTransform.scaleY, unityTransform.scaleZ);
    }
  }, [gltf.scene, unityTransform, isUnityModel]);
  
  return <primitive object={gltf.scene} scale={1} />;
}

function PosterCapture({ onCapture, isUnityModel }: { onCapture: (dataUrl: string) => void; isUnityModel?: boolean }) {
  const { gl, scene, camera } = useThree();
  
  useEffect(() => {
    // Unity models need more time to render the grid and complex scene
    const captureDelay = isUnityModel ? 1000 : 500;
    
    const timer = setTimeout(() => {
      try {
        // Check if scene has children (model is loaded)
        if (scene.children.length > 0) {
          console.log(`Capturing poster for ${isUnityModel ? 'Unity' : 'regular'} model, scene children:`, scene.children.length);
          
          // Force a render before capturing
          gl.render(scene, camera);
          
          const dataUrl = gl.domElement.toDataURL('image/png');
          if (dataUrl && dataUrl.length > 100) {
            onCapture(dataUrl);
          } else {
            console.warn('Captured poster seems empty or invalid');
          }
        } else {
          console.warn('Scene not ready for poster capture, children:', scene.children.length);
        }
      } catch (error) {
        console.error('Failed to capture poster:', error);
      }
    }, captureDelay);
    
    return () => clearTimeout(timer);
  }, [gl, scene, camera, onCapture, isUnityModel]);
  
  return null;
}

export default function ThreeDThumbnail({ modelUrl, jobId, userId, unityTransform, isUnityModel }: ThreeDThumbnailProps) {
  const [loadError, setLoadError] = useState(false);
  const [activeUrl, setActiveUrl] = useState<string>('');
  const [isUrlValidated, setIsUrlValidated] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cachedPosterUrl, setCachedPosterUrl] = useState<string | null>(null);
  const [isInView, setIsInView] = useState(false);
  const normalizedUrl = Array.isArray(modelUrl) ? modelUrl[0] : modelUrl;
  const canvasRef = useRef<HTMLDivElement>(null);
  const cacheKey = getPosterCacheKey(jobId, normalizedUrl);

  const retryCount = useRef(0);
  const maxRetries = 2;
  
  // Use cached poster or newly captured poster
  const displayPosterUrl = posterUrl || cachedPosterUrl;

  // Intersection observer to only render when visible
  useEffect(() => {
    if (!canvasRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(canvasRef.current);

    return () => {
      if (canvasRef.current) {
        observer.unobserve(canvasRef.current);
      }
    };
  }, []);

  // Load cached poster from IndexedDB on mount
  useEffect(() => {
    const loadCachedPoster = async () => {
      if (!cacheKey) return;
      
      try {
        const cached = await posterCache.get(cacheKey);
        if (cached) {
          console.log(`✅ Loaded cached poster from IndexedDB for ${isUnityModel ? 'Unity' : 'CAD'} model:`, jobId || normalizedUrl);
          setCachedPosterUrl(cached);
          setIsLoading(false);
        } else {
          console.log(`❌ No cached poster found for ${isUnityModel ? 'Unity' : 'CAD'} model:`, jobId || normalizedUrl);
        }
      } catch (error) {
        console.error('Failed to load cached poster:', error);
      }
    };

    loadCachedPoster();
  }, [cacheKey, jobId, normalizedUrl, isUnityModel]);

  const handleModelError = () => {
    retryCount.current += 1;
    console.log(`Model load attempt ${retryCount.current} failed for:`, activeUrl);
    
    if (retryCount.current >= maxRetries) {
      console.log('Max retries reached, showing fallback');
      setLoadError(true);
      setIsLoading(false);
      return;
    }
    
    setLoadError(true);
    setTimeout(() => {
      setLoadError(false);
      setCanvasKey((k) => k + 1);
    }, 300);
  };

  const handlePosterCapture = async (dataUrl: string) => {
    console.log(`🎨 Poster captured for ${isUnityModel ? 'Unity' : 'CAD'} model:`, jobId || normalizedUrl);
    console.log('Poster data URL length:', dataUrl.length);
    setPosterUrl(dataUrl);
    setIsLoading(false);
    
    // Save to IndexedDB cache for instant future loads
    if (cacheKey) {
      try {
        await posterCache.set(cacheKey, dataUrl, normalizedUrl);
        setCachedPosterUrl(dataUrl);
        console.log('✅ Poster saved to cache');
        
        // Trigger cleanup to maintain reasonable cache size
        posterCache.cleanup(50).catch(err => 
          console.warn('Cache cleanup failed:', err)
        );
      } catch (error) {
        console.error('Failed to cache poster:', error);
      }
    }
  };

  // Fallback: if poster capture takes too long, stop showing loading state
  useEffect(() => {
    if (isLoading && isInView && activeUrl && !displayPosterUrl) {
      // Give Unity models more time (they need 1s for capture + loading time)
      const timeoutDuration = isUnityModel ? 5000 : 3000;
      const fallbackTimer = setTimeout(() => {
        console.log('Poster capture timeout, showing live canvas');
        setIsLoading(false);
      }, timeoutDuration);
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [isLoading, isInView, activeUrl, displayPosterUrl, isUnityModel]);

  // Try to construct Supabase storage URL for models - with pre-flight validation
  useEffect(() => {
    const checkAndSetUrl = async () => {
      retryCount.current = 0;
      setLoadError(false);
      setIsUrlValidated(false);
      setActiveUrl('');
      
      if (!cachedPosterUrl) {
        setIsLoading(true);
      }
      
      // If it's a Replicate URL and we have a jobId, try Supabase storage first
      if (normalizedUrl?.includes('replicate.delivery') && jobId) {
        const patterns = userId 
          ? [`https://igqtsjpbkjhvlliuhpcw.supabase.co/storage/v1/object/public/generated-models/${userId}/${jobId}/model.glb`]
          : [`https://igqtsjpbkjhvlliuhpcw.supabase.co/storage/v1/object/public/generated-models/${jobId}/model.glb`];
        
        for (const supabaseUrl of patterns) {
          try {
            const response = await fetch(supabaseUrl, { method: 'HEAD' });
            if (response.ok) {
              console.log('Thumbnail: Found model in Supabase storage');
              setActiveUrl(supabaseUrl);
              setIsUrlValidated(true);
              return;
            }
          } catch (error) {
            console.log(`Thumbnail: Model not found at ${supabaseUrl}`);
          }
        }
        
        // Check if Replicate URL is still valid
        try {
          const replicateResponse = await fetch(normalizedUrl, { method: 'HEAD' });
          if (!replicateResponse.ok) {
            console.warn('Replicate URL expired and model not in storage');
            setLoadError(true);
            setIsLoading(false);
            setIsUrlValidated(true);
            return;
          }
          // Replicate URL is valid
          setActiveUrl(normalizedUrl);
          setIsUrlValidated(true);
          return;
        } catch (error) {
          console.warn('Failed to validate Replicate URL:', error);
          setLoadError(true);
          setIsLoading(false);
          setIsUrlValidated(true);
          return;
        }
      }
      
      // Validate non-Replicate URL before setting it
      if (normalizedUrl) {
        try {
          const response = await fetch(normalizedUrl, { method: 'HEAD' });
          if (!response.ok) {
            console.warn('Model URL is not accessible:', normalizedUrl);
            setLoadError(true);
            setIsLoading(false);
            setIsUrlValidated(true);
            return;
          }
          setActiveUrl(normalizedUrl);
          setIsUrlValidated(true);
        } catch (error) {
          console.warn('Failed to validate model URL:', error);
          setLoadError(true);
          setIsLoading(false);
          setIsUrlValidated(true);
        }
      } else {
        setIsUrlValidated(true);
      }
    };
    
    if (normalizedUrl) {
      checkAndSetUrl();
    } else {
      setIsUrlValidated(true);
    }
  }, [normalizedUrl, jobId, userId, cachedPosterUrl]);

  // Cleanup on unmount - dispose WebGL resources
  useEffect(() => {
    return () => {
      if (posterUrl) {
        URL.revokeObjectURL(posterUrl);
      }
      // Force WebGL context cleanup
      if (canvasRef.current) {
        const canvas = canvasRef.current.querySelector('canvas');
        if (canvas) {
          const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
          if (gl) {
            const loseContext = gl.getExtension('WEBGL_lose_context');
            if (loseContext) {
              loseContext.loseContext();
            }
          }
        }
      }
    };
  }, [posterUrl]);

  // If we have a cached poster, show it immediately even if URL is still validating
  if (cachedPosterUrl) {
    return (
      <div className="w-full h-full bg-card relative" ref={canvasRef}>
        <img 
          src={cachedPosterUrl} 
          alt="Model preview" 
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // If no valid URL, error, or still validating, show fallback
  if (!isUrlValidated || !activeUrl || loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-card">
        <div className="text-center">
          {!isUrlValidated && !loadError ? (
            <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
          ) : (
            <>
              <Package className="w-12 h-12 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">{loadError ? 'Model expired' : '3D Model'}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-card relative" ref={canvasRef}>
      {/* Show loading overlay only when actively loading */}
      {isLoading && isInView && !displayPosterUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}
      
      {/* Render Canvas when in view and we have a valid URL */}
      {!loadError && isInView && activeUrl && !displayPosterUrl && (
        <Canvas
          key={canvasKey}
          camera={{ position: [0, 0, 3], fov: 50 }}
          className="w-full h-full"
          dpr={[1, 1]}
          frameloop="always"
          gl={{ 
            antialias: false,
            alpha: true, 
            powerPreference: 'low-power', 
            preserveDrawingBuffer: true,
            failIfMajorPerformanceCaveat: false
          }}
          onCreated={({ gl, invalidate }) => {
            const bgColor = getComputedStyle(document.documentElement)
              .getPropertyValue('--background')
              .trim()
              .split(' ')
              .map(v => parseFloat(v));
            
            const hslColor = `hsl(${bgColor[0]}, ${bgColor[1]}%, ${bgColor[2]}%)`;
            gl.setClearColor(hslColor);
            invalidate();
            
            const elem = gl.domElement as HTMLCanvasElement;
            const onLost = (e: any) => { 
              e.preventDefault?.(); 
              if (posterUrl) {
                setIsLoading(false);
              }
              setCanvasKey((k: number) => k + 1); 
            };
            const onRestored = () => setCanvasKey((k: number) => k + 1);
            elem.addEventListener('webglcontextlost', onLost as any, { passive: false } as any);
            elem.addEventListener('webglcontextrestored', onRestored as any);
          }}
        >
          <Suspense fallback={null}>
            <ModelErrorBoundary onError={handleModelError}>
              {isUnityModel ? (
                <>
                  <ambientLight intensity={0.4} />
                  <directionalLight position={[10, 10, 5]} intensity={1} />
                  <Model url={activeUrl} unityTransform={unityTransform} isUnityModel={isUnityModel} />
                  <Grid
                    args={[20, 20]}
                    cellSize={1}
                    cellThickness={0.5}
                    cellColor="#555555"
                    sectionSize={5}
                    sectionThickness={1}
                    sectionColor="#777777"
                    fadeDistance={30}
                    fadeStrength={1}
                    followCamera={false}
                    infiniteGrid={false}
                    position={[0, -0.01, 0]}
                  />
                  <Environment preset="studio" />
                </>
              ) : (
                <>
                  <Environment preset="studio" />
                  <ambientLight intensity={0.3} />
                  <directionalLight position={[5, 5, 5]} intensity={0.5} />
                  <PresentationControls
                    speed={1.5}
                    global
                    zoom={0.8}
                    polar={[-Math.PI / 4, Math.PI / 4]}
                    enabled={false}
                  >
                    <Model url={activeUrl} />
                  </PresentationControls>
                </>
              )}
              {!displayPosterUrl && <PosterCapture onCapture={handlePosterCapture} isUnityModel={isUnityModel} />}
            </ModelErrorBoundary>
          </Suspense>
        </Canvas>
      )}
      
      {/* Show static poster if we have it (either cached or newly captured) */}
      {displayPosterUrl && (
        <img 
          src={displayPosterUrl} 
          alt="Model preview" 
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
