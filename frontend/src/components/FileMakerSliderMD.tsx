'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Paper, Slider, Stack, Typography, IconButton } from '@mui/material'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

interface FileMakerSliderMDProps {
  currentIndex: number
  total: number
  onSlide: (index: number) => void
  /** Se true, chama onSlide enquanto arrasta (pré-visualização ao vivo). Default: false (confirma só ao soltar) */
  livePreview?: boolean
  /** Largura máxima do componente em px */
  maxWidth?: number
}

export default function FileMakerSliderMD({
  currentIndex,
  total,
  onSlide,
  livePreview = false,
  maxWidth = 260,
}: FileMakerSliderMDProps) {
  const [value, setValue] = useState<number>(currentIndex)
  const isDraggingRef = useRef(false)

  const max = Math.max(0, total - 1)

  // Sincroniza com mudanças externas no índice quando não está arrastando
  useEffect(() => {
    if (!isDraggingRef.current) setValue(Math.min(Math.max(0, currentIndex), max))
  }, [currentIndex, max])

  const marks = useMemo(() => {
    if (total <= 1) return []
    // Mostrar apenas extremos para não poluir; Material Design "clean"
    return [
      { value: 0, label: '1' },
      { value: max, label: String(total) },
    ]
  }, [total, max])

  const commit = (v: number) => onSlide(Math.min(Math.max(0, v), max))

  const handleChange = (_: Event, newValue: number | number[]) => {
    const v = Array.isArray(newValue) ? newValue[0] : newValue
    setValue(v)
    if (livePreview) commit(v)
  }

  const handleChangeCommitted = (_: Event | React.SyntheticEvent, newValue: number | number[]) => {
    isDraggingRef.current = false
    const v = Array.isArray(newValue) ? newValue[0] : newValue
    commit(v)
  }

  const handlePointerDown = () => {
    isDraggingRef.current = true
  }

  const stepBy = (delta: number) => {
    const next = Math.min(Math.max(0, value + delta), max)
    setValue(next)
    commit(next)
  }

  const disabled = total <= 1

  return (
    <Paper
      elevation={1}
      sx={{
        p: 1,
        px: 1.25,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        maxWidth,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton
          size="small"
          onClick={() => stepBy(-1)}
          disabled={disabled || value <= 0}
          aria-label="Anterior"
        >
          <NavigateBeforeIcon fontSize="small" />
        </IconButton>

        <Typography
          variant="caption"
          sx={{ minWidth: 48, textAlign: 'right', color: 'text.secondary' }}
        >
          {total ? value + 1 : 0}/{total}
        </Typography>

        <Box sx={{ flex: 1, px: 0.5 }}>
          <Slider
            value={value}
            min={0}
            max={max}
            step={1}
            marks={marks}
            onChange={handleChange}
            onChangeCommitted={handleChangeCommitted}
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
            size="small"
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${(v as number) + 1} / ${total}`}
            aria-label="Navegar pelos registros"
            getAriaValueText={(v) => `${(v as number) + 1} de ${total}`}
            disabled={disabled}
            sx={{
              // Trilho baixo/clean
              height: 6,
              px: 1,
              '& .MuiSlider-rail': { opacity: 1, bgcolor: 'action.selected' },
              '& .MuiSlider-track': { border: 'none' }, // usa cor primaria
              // Thumb pequeno, mas com hit target generoso
              '& .MuiSlider-thumb': {
                width: 16,
                height: 16,
                bgcolor: '#fff',
                border: '3px solid',
                borderColor: 'primary.main',
                boxShadow: 3,
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: 5,
                  borderColor: 'primary.dark',
                },
                '&:active': { transform: 'scale(1.08)' },
                // Área de toque maior (facilita clique/arraste)
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 28,
                  height: 28,
                },
              },
              '& .MuiSlider-markLabel': { fontSize: 10, color: 'text.disabled' },
            }}
          />
        </Box>

        <Typography
          variant="caption"
          sx={{ minWidth: 48, textAlign: 'right', color: 'text.disabled' }}
        >
          {total} total
        </Typography>

        <IconButton
          size="small"
          onClick={() => stepBy(1)}
          disabled={disabled || value >= max}
          aria-label="Próximo"
        >
          <NavigateNextIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  )
}
