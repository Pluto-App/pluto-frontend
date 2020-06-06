/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import BackButton from '../../widgets/BackButton'
import { css } from "@emotion/core";
import RingLoader from "react-spinners/RingLoader";

export default function UserUpdate() {

    let history = useHistory();

    const { state, actions } = useOvermind();

    const override = css`
        display: block;
        margin: 0 auto;
        border-color: red;
    `;

    return (
        <div className="w-full flex">
            <div className="w-full bg-gray-900 ml-15 flex-1 text-white" style={{ height: "calc(100vh - 30px)" }}>
                <BackButton url={'/home'}></BackButton>
            </div>
        </div>
    )

}
