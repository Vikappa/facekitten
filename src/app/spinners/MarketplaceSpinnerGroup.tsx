'use client'

import MarketplaceSidebarheader from "../atoms/MarketplaceSidebarheader"
import MarketplaceSideSearchBar from "../atoms/MarketplaceSideSearchBar"
import MarketPlaceSpinner from "./MarketPlaceSpinner"
import ThreeDotSpinner from "./ThreeDotSpinner"

const MarketplaceSpinnerGroup = () => {
    return(
    <div className="m-0 p-0 w-100 container-fluid row">

        <div className="col-0 col-sm-2 bg-white shadow m-0 h-100 min-vh-sm-100 px-2" >
          <MarketplaceSidebarheader/>
          <MarketplaceSideSearchBar/>
        </div>

        <div className="col-12 col-sm-9 m-0 container d-flex flex-wrap">
            
            <div className="d-flex flex-column gap-3 m-0 p-0 col-6 col-md-4 col-lg-3">
                <MarketPlaceSpinner/>
            </div>
            <div className="d-flex flex-column gap-3 m-0 p-0 col-6 col-md-4 col-lg-3">
                <MarketPlaceSpinner/>
            </div>
            <div className="d-flex flex-column gap-3 m-0 p-0 col-6 col-md-4 col-lg-3">
                <MarketPlaceSpinner/>
            </div>
            <div className="d-flex flex-column gap-3 m-0 p-0 col-6 col-md-4 col-lg-3">
                <MarketPlaceSpinner/>
            </div>
            <div className="d-flex flex-column gap-3 m-0 p-0 col-6 col-md-4 col-lg-3">
                <MarketPlaceSpinner/>
            </div>
            <div className="d-flex flex-column gap-3 m-0 p-0 col-6 col-md-4 col-lg-3">
                <MarketPlaceSpinner/>
            </div>
            <div className="d-flex flex-column gap-3 m-0 p-0 col-6 col-md-4 col-lg-3">
                <MarketPlaceSpinner/>
            </div>
            <div className="d-flex flex-column gap-3 m-0 p-0 col-6 col-md-4 col-lg-3">
                <MarketPlaceSpinner/>
            </div>
        </div>

    </div>
    )
}

export default MarketplaceSpinnerGroup 