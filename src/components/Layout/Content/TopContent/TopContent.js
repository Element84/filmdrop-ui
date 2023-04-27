import { React, useState } from 'react'
import './TopContent.css'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Search from '../../../Search/Search'

const TopContent = () => {
  const [isActive, setActive] = useState(false)

  const toggleClass = () => {
    setActive(!isActive)
  }

  return (
    <div className={`TopContent ${isActive ? 'active' : 'not-active'}`}>
      <div className="mobileMenu" onClick={toggleClass}>
        <div className="label">Search Filter</div>
        <div className="downArrow">
          <ArrowDropDownIcon />
        </div>
      </div>
      <Search></Search>
    </div>
  )
}

export default TopContent
