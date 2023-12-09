import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Map } from "react-kakao-maps-sdk";
import "react-datepicker/dist/react-datepicker.css";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import PageLayout from "../components/PageLayout";
import InsideMap from "../components/InsideMap";
import API from "../utils/API.js";
import useUserPosition from "../hooks/useUserPosition";
import useWindowSize from "../hooks/useWindowSize";
import "../App.css";
import cctvIdState from "../recoil/cctvIdState.js";
import abnormalBehaviorState from "../recoil/abnormalBehaviorState.js";
import SelectDate from "../components/SelectDate.jsx";
import resultState from "../recoil/resultState";

const Frame = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
`;

const MapContainer = styled.div`
  position: relative;
`;

const Rectangle = styled.div`
  position: absolute;
  top: 30px;
  right: 30px;
  bottom: 30px;
  width: 380px;
  background-color: #f5f7fa;
  border-radius: 20px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
  z-index: 2;
`;

const Box = styled.div`
  margin-top: 80px;
  margin-left: 50px;
  margin-right: 30px;
`;

const Types = styled.div`
  font-size: 25px;
  font-style: normal;
  font-weight: 700;
  margin-bottom: 40px;
`;

const Contents = styled.div`
  margin-top: 15px;
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: 0.5;
`;

const RadioButtonGroup = styled.div`
  margin-top: 15px;
  margin-bottom: 20px;
  margin-left: 10px;
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.5;
`;

const RadioButton = styled.div`
  display: block;
`;

const SelectionButton = styled.div`
  display: inline-block;
  padding: 15px 15px;
  font-size: 16px;
  margin: 5px;
  background-color: ${(props) =>
    props.active === "true" ? "#3a3d92" : "#ffffff"};
  color: ${(props) => (props.active === "true" ? "#ffffff" : "#3a3d92")};
  transition: background-color 0.3s;
  text-decoration: none;
  border-radius: 5px;
  // border: 2px solid #3a3d92;
  cursor: pointer;

  &:hover {
    background-color: #3a3d92;
    color: #ffffff;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const NextButton = styled.div`
  display: inline-block;
  padding: 10px 20px;
  margin: 5px;
  font-size: 20px;
  font-weight: 700;
  background-color: #029d65;
  color: #ffffff;
  text-decoration: none;
  border-radius: 5px;
  cursor: pointer;
`;

function SearchPage() {
  const abnormalType = ["fight", "assault", "drunken", "swoon", "kidnap"];
  const windowSize = useWindowSize();
  const userPosition = useUserPosition();
  const selectedCctvIds = useRecoilValue(cctvIdState);
  const selectedCount = selectedCctvIds.length;
  const [activeStates, setActiveStates] = useState(
    Array(abnormalType.length).fill(false)
  );

  const [positions, setPositions] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get("/cctvs/allCctv");
        if (response.status === 200) {
          const data = response.data;
          console.log(data);
          setPositions(data);
        } else {
          console.error("API 호출 실패");
        }
      } catch (error) {
        console.error("CCTV 데이터를 받아오는데 실패했습니다.", error);
      }
    };
    fetchData();
  }, []);

  const handleClick = (index) => {
    const newActiveStates = [...activeStates];
    newActiveStates[index] = !newActiveStates[index];
    setActiveStates(newActiveStates);
  };

  const [isRealTimeSelected, setIsRealTimeSelected] = useState(true);

  const handleSearchPeriodChange = (event) => {
    const { value } = event.target;
    if (value === "real-time") {
      setIsRealTimeSelected(true);
    } else {
      setIsRealTimeSelected(false);
    }
  };

  const cctvId = useRecoilValue(cctvIdState);

  /* * * * * * * * * * * * * * * * * *
   *     {
   *       metaDataId: "",
   *       foundTime: "",
   *       entityFoundTime: "",
   *       cctvId: "",
   *       type: "",
   *       abnormalType: "",
   *       quality: "",
   *       videoId: "",
   *       photoId: "",
   *     }
   * * * * * * * * * * * * * * * * * * */
  const [sendResult, setSendResult] = useState([]);

  // const [getResult, setGetResult] = useState([{
  //     metaDataId: "",
  //     foundTime: "",
  //     entityFoundTime: "",
  //     cctvId: "",
  //     type: "",
  //     abnormalType: "",
  //     quality: "",
  //     videoId: "",
  //     photoId: "",
  // },]);

  useEffect(() => {
    console.log("sendResult updated:", sendResult);
  }, [sendResult]);

  // useEffect(() => {
  //     console.log("getResult updated:", getResult);
  // }, [getResult]);

  const createResult = () => {
    const result = [];
    for (let i = 0; i < cctvId.length; i += 1) {
      for (let j = 0; j < activeStates.length; j += 1) {
        if (activeStates[j] === true) {
          result.push({
            startDate: selectedDateRange[0],
            endDate: selectedDateRange[1],
            cctvId: cctvId[i],
            abnormalType: abnormalType[j],
          });
        }
      }
    }
    return result;
  };

  useEffect(() => {
    console.log(cctvId, activeStates.length, selectedDateRange);
    const res = createResult();
    setSendResult(res);

    console.log(res);
  }, [cctvId, activeStates, selectedDateRange]);

  const nav = useNavigate();

  const setRecoilResultState = useSetRecoilState(resultState);

  const handleNextButtonClick = async () => {
    try {
      const response = await API.post("/metadata/Legend", sendResult);
      // console.log(response);
      if (response.status === 200) {
        console.log("데이터 수신 성공", response);
        console.log("111111111");
        setRecoilResultState(response.data);
        nav("/result");
      } else {
        console.error("API 호출 실패");
      }
    } catch (error) {
      console.error("데이터 전송 실패", error);
    }
  };

  const handleDate = (dateResult) => {
    setSelectedDateRange(dateResult);
  };

  return (
    <PageLayout>
      <Frame>
        <div className="search">
          <div className="search-main">
            <MapContainer>
              <Rectangle>
                <Box>
                  <Types>
                    선택된 CCTV | {selectedCount}개<Contents>ID</Contents>
                    <Contents>위치</Contents>
                  </Types>
                  <Types>
                    검색설정
                    <Contents>검색 기간</Contents>
                    <RadioButtonGroup>
                      <RadioButton>
                        <input
                          type="radio"
                          name="searchPeriod"
                          value="real-time"
                          onChange={handleSearchPeriodChange}
                        />
                        실시간
                      </RadioButton>
                      <RadioButton>
                        <input
                          type="radio"
                          name="searchPeriod"
                          value="set-time"
                          onChange={handleSearchPeriodChange}
                        />
                        구간 설정
                        {!isRealTimeSelected && (
                          <SelectDate handleDate={handleDate} />
                        )}
                      </RadioButton>
                    </RadioButtonGroup>
                    {!isRealTimeSelected && (
                      <Contents>
                        이상행동 선택
                        <div style={{ marginTop: "10px" }}>
                          {abnormalType.map((behavior, index) => (
                            <SelectionButton
                              key={index}
                              active={activeStates[index].toString()}
                              onClick={() => handleClick(index)}
                            >
                              {index === 0 && "싸움"}
                              {index === 1 && "폭행"}
                              {index === 2 && "주취행동"}
                              {index === 3 && "기절"}
                              {index === 4 && "납치"}
                            </SelectionButton>
                          ))}
                        </div>
                      </Contents>
                    )}
                  </Types>
                </Box>
                <ButtonContainer>
                  {/*<Link to="/result">*/}
                  <NextButton onClick={handleNextButtonClick}>
                    검색 결과 보기
                  </NextButton>
                  {/*</Link>*/}
                </ButtonContainer>
              </Rectangle>
              <Map
                center={userPosition}
                style={{
                  width: `${windowSize.width}px`,
                  height: `${windowSize.height}px`,
                }}
                level={3}
              >
                <InsideMap positions={positions} />
              </Map>
            </MapContainer>
          </div>
        </div>
      </Frame>
    </PageLayout>
  );
}

export default SearchPage;