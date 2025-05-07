import React from 'react'
import Pagecontainer from '../container/pagecontainer'
import Yenigelenler from '../component/yenigelenler'
import Ikilikesfet from "../component/Ikilikesfet";
import Cantalar from "../component/Cantalar";
import Ikilikesfet1 from '../component/Ikilikesfet1'
import Footer from '../component/Footer'
import Marque from '../component/Marque'
import CokSatilan from '../component/CokSatilan'
import Slider from '../component/Sliders';

function home() {
    return (
        <div>
            <Slider />
            <Marque />

            <Pagecontainer>
                <Yenigelenler />
            </Pagecontainer>

            <Pagecontainer>
                <Ikilikesfet />
            </Pagecontainer>

            <Pagecontainer>
                <CokSatilan />
            </Pagecontainer>


            < Pagecontainer>
                <Ikilikesfet1 />
            </Pagecontainer>

            <Pagecontainer>
                <Cantalar />
            </Pagecontainer>



        </div>
    )
}

export default home