import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import './popup.css'
import '@fontsource/roboto'
import WeatherCard from '../components/WeatherCard/WeatherCard'
import { InputBase, IconButton, Paper, Box, Grid } from '@material-ui/core'
import { Messages } from '../utils/messages'
import {
  Add as AddButton,
  PictureInPicture as PictureInPictureIcon,
} from '@material-ui/icons'
import {
  setStoredCities,
  getStoredCities,
  setStoredOptions,
  getStoredOptions,
  LocalStorageOptions,
} from '../utils/storage'
import { OpenWeatherTempScale } from '../utils/api'

const App: React.FC<{}> = () => {
  const [cities, setCities] = useState<string[]>([])
  const [cityInput, setCityInput] = useState<string>('')
  const [options, setOptions] = useState<LocalStorageOptions | null>(null)

  useEffect(() => {
    getStoredCities().then((cities) => setCities(cities))
    getStoredOptions().then((options) => setOptions(options))
  }, [])

  const handleCityButtonClick = () => {
    if (cityInput === '') {
      return
    }
    const updatedCities = [...cities, cityInput]
    setStoredCities(updatedCities).then(() => {
      setCities(updatedCities)
      setCityInput('')
    })
  }

  const handleCityDeleteButtonClick = (index: number) => {
    cities.splice(index, 1)
    const updatedCities = [...cities]
    setStoredCities(updatedCities).then(() => {
      setCities(updatedCities)
    })
  }

  const handleTempScaleButtonClick = () => {
    const updateOptions: LocalStorageOptions = {
      ...options,
      tempScale: options.tempScale === 'metric' ? 'imperial' : 'metric',
    }
    setStoredOptions(updateOptions).then(() => {
      setOptions(updateOptions)
    })
  }

  const handleOverlayButtonClick = () => {
    chrome.tabs.query(
      {
        active: true,
      },
      (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, Messages.TOGGLE_OVERLAY)
        }
      }
    )
  }

  if (!options) {
    return null
  }

  return (
    <div>
      <Box mx="8px" my="16px">
        <Grid container justifyContent="space-evenly">
          <Grid item>
            <Paper>
              <Box px="15px" py="5px">
                <InputBase
                  placeholder="Enter a city name"
                  value={cityInput}
                  onChange={(event) => setCityInput(event.target.value)}
                />

                <IconButton size="small" onClick={handleCityButtonClick}>
                  <AddButton />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
          <Grid item>
            <Paper>
              <Box px="8px" py="8px">
                <IconButton size="small" onClick={handleTempScaleButtonClick}>
                  {options.tempScale === 'metric' ? '\u2103' : '\u2109'}
                </IconButton>
              </Box>
            </Paper>
          </Grid>
          <Grid item>
            <Paper>
              <Box px="6.5px" py="6.5px">
                <IconButton size="small" onClick={handleOverlayButtonClick}>
                  <PictureInPictureIcon />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        {options.homeCity != '' && (
          <WeatherCard city={options.homeCity} tempScale={options.tempScale} />
        )}
        {cities.map((city, index) => (
          <WeatherCard
            city={city}
            key={index}
            tempScale={options.tempScale}
            onDelete={() => handleCityDeleteButtonClick(index)}
          />
        ))}
        <Box height="16px"></Box>
      </Box>
    </div>
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)
