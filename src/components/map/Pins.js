import { Map } from '@styled-icons/boxicons-solid'
import { useEffect, useState } from 'react'
import styled from 'styled-components/macro'

import PinSvg from './AddLocationPin.svg'

const AddLocationPin = styled.img.attrs({
  src: PinSvg,
})`
  position: absolute;
  top: 50%;
  left: 50%;
  // How to do this without transform/should I?
  transform: translate(-50%, -100%);
  // Display on top of map
  z-index: 1;
  // Allow clicking/dragging through the pin
  pointer-events: none;
  touch-action: none;
`

const MapPin = styled(Map)`
  // TODO: adjust intrusiveness of pin
  height: 48px;
  z-index: 4;

  position: absolute;
  transform: translate(-50%, -50%);
  top: -20px;
  filter: drop-shadow(0px 1px 5px rgba(0, 0, 0, 0.45));
  color: ${({ theme }) => theme.orange};
`

const NewLocationMapPin = styled(Map)`
  height: 48px;
  z-index: 4;
  position: absolute;
  transform: translate(-50%, -50%);
  top: -20px;
  filter: drop-shadow(0px 1px 5px rgba(0, 0, 0, 0.45));
  color: ${({ theme }) => theme.blue};
`

const DraggableNewLocationMapPin = ({
  onDragEnd,
  onChange,
  $geoService,
  lat,
  lng,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e) => {
    e.stopPropagation()
    const { x, y } = $geoService.fromLatLngToContainerPixel({ lat, lng })
    setDragOffset({ x: e.clientX - x, y: e.clientY - y })
    setIsDragging(true)
  }

  const handleMouseUp = (e) => {
    e.stopPropagation()
    setIsDragging(false)
    const { lat: newLat, lng: newLng } = $geoService.fromContainerPixelToLatLng(
      {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      },
    )
    onDragEnd({ lat: newLat, lng: newLng })
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      e.stopPropagation()
      const { lat: newLat, lng: newLng } =
        $geoService.fromContainerPixelToLatLng({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      onChange({ lat: newLat, lng: newLng })
    }
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset]) //eslint-disable-line

  return (
    <NewLocationMapPin
      lat={lat}
      lng={lng}
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging ? 'grabbing' : 'pointer' }} // 'grab' taken for panning
    />
  )
}

export { AddLocationPin, DraggableNewLocationMapPin, MapPin }
