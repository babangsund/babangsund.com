import React from "react"

const themes = ["dark", "light"]
const localStorageKey = "babangsund.theme"

function useTheme() {
  const [value, setValue] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(localStorageKey)
      const parsed = item && JSON.parse(item)
      return !parsed || !themes.includes(parsed) ? "dark" : parsed
    } catch (error) {
      return "dark"
    }
  })
  return [
    value,
    React.useCallback(() => {
      setValue(oldTheme => {
        const newTheme = oldTheme === "dark" ? "light" : "dark"
        window.localStorage.setItem(localStorageKey, JSON.stringify(newTheme))
        return newTheme
      })
    }, []),
  ]
}

export default useTheme
