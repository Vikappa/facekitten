'use client'
const HomePageSideLi = (
    {icon, text}:
    {icon: React.ReactNode, text: string}
) => {

    return(
    <li
    className="d-flex align-items-center gap-2 py-2 rounded-2 liSideElement   "
    >
        {icon}{text}
    </li>)
}

export default HomePageSideLi