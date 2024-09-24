'use client'
const HomePageSideLi = (
    {icon, text, funzione}:
    {icon: React.ReactNode, text: string; funzione:()=> void}
) => {

    return(
    <li onClick={funzione}
    className="d-flex align-items-center gap-2 py-2 rounded-2 liSideElement   "
    >
        {icon}{text}
    </li>)
}

export default HomePageSideLi