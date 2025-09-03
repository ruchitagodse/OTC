import React from 'react'
import Layout from '../../../component/Layout'
import "../../../src/app/styles/main.scss";

import AddBirthday from '../../../component/AddBirthday';


const BirthdayCanva = () => {
    return (
        <div>
            <Layout>
                 <AddBirthday/>
            </Layout>
           
        </div>
    )
}

export default BirthdayCanva