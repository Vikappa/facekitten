'use client'

const ProfilePageBarButton = ({text, selected, setSelected}: 
    {text: string, selected: boolean, setSelected: () => void}) => {

    return(
        <div className={`p-2  rounded-2 ${!selected ? 'sideLiUser' : ''}`}
        onClick={setSelected}>
            <p className={`m-0 ${selected ? `text-primary fw-semibold` : ''}`}>
                {text}
            </p>
            {selected && <div className="bg-primary rounded-2" 
            style={{height:'2px',
                transform:'translateY(10px)',
            }}></div>}
        </div>    
    )
}

export default ProfilePageBarButton