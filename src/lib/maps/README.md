# Mapbox integration notes (Sprint 5)
#
# 1. Set NEXT_PUBLIC_MAPBOX_TOKEN in .env
# 2. Load block GeoJSON from MapFeature.geometry via domain query
# 3. Render with mapbox-gl Map + GeoJSONSource
# 4. On block click, open Sheet drawer with block summary + quick actions
# 5. Future 3D: enable terrain + pitch on same GeoJSON source
