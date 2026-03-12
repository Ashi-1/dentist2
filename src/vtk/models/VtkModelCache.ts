import vtkSTLReader from "@kitware/vtk.js/IO/Geometry/STLReader";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";

const polydataCache = new Map<string, any>();
const inflight = new Map<string, Promise<any>>();

export async function preloadModel(path: string): Promise<any> {
  if (polydataCache.has(path)) return polydataCache.get(path);

  if (inflight.has(path)) return inflight.get(path);

  const promise = (async () => {
    const reader = vtkSTLReader.newInstance();
    await reader.setUrl(path);
    const polydata = reader.getOutputData();
    polydataCache.set(path, polydata);
    inflight.delete(path);
    return polydata;
  })();

  inflight.set(path, promise);
  return promise;
}

export function createActorFromCache(path: string): any | null {
  const polydata = polydataCache.get(path);
  if (!polydata) return null;

  const mapper = vtkMapper.newInstance();
  mapper.setInputData(polydata);

  const actor = vtkActor.newInstance();
  actor.setMapper(mapper);
  actor.setPickable(true);

  return actor;
}

export async function loadOrCreateActor(path: string): Promise<any | null> {
  await preloadModel(path);
  return createActorFromCache(path);
}

export function getModelBoundsCenter(path: string): number[] | null {
  const polydata = polydataCache.get(path);
  if (!polydata) return null;
  const b = polydata.getBounds();
  return [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2, (b[4] + b[5]) / 2];
}

export function getModelBounds(path: string): number[] | null {
  const polydata = polydataCache.get(path);
  if (!polydata) return null;
  return polydata.getBounds();
}

export function isCached(path: string): boolean {
  return polydataCache.has(path);
}

export function clearCache() {
  polydataCache.clear();
  inflight.clear();
}
