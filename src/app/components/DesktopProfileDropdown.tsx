'use client'
const DeskTopProfileDropdown = ({show}: {show:boolean}) => {

    if(!show) return null
    
    return(
    <ul className="position-absolute">
        <li>A</li>
        <li>B</li>
        <li>C</li>
    </ul>
)
}

export default DeskTopProfileDropdown