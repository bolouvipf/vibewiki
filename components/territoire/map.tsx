import { TerritoryZone, type ZoneProps } from "./zone"

export interface TerritoryMapProps {
  zones: ZoneProps[]
}

export function TerritoryMap({ zones }: TerritoryMapProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {zones.map((zone) => (
        <TerritoryZone key={zone.pillarId} {...zone} />
      ))}
    </div>
  )
}
