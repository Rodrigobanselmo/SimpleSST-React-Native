import React, {useState,useContext,useRef,useEffect} from 'react';
import {TouchableHighlight, StatusBar,Dimensions,Animated as AnimatedReact,View,StyleSheet,Text, TouchableOpacity} from 'react-native';
import {useReactModal} from '../../../context/ModalContext'
import {ThemeContext} from "styled-components/native";
import {Header} from '../../../components/basicComponents/Header';
import {ButtonAnimated,ButtonInitial} from '../../../components/basicComponents/Button';
import Icons from '../../../components/Icons'
import { Directions, FlingGestureHandler,ScrollView, State } from 'react-native-gesture-handler';
import {CardContainer} from './cardContainer'
import {BackCard} from './backCard'
import {NoRiskComponent,RiskComponent,TitleText,AddRecComponent,TitleRecText} from './riskComponent'
import {BackGroupView,CardView,Container,ContainerSafe,SheetHandle,SheetHeaderCont,SheetHeader,SheetBody} from './styles';
import { useSelector } from 'react-redux';

import BottomSheet from 'reanimated-bottom-sheet';
import Animated from 'react-native-reanimated';
import styled, {css} from "styled-components";

const IconsPlusMinus = styled(Icons)`
  position: absolute;
  bottom:5px;
  right:7px;
  opacity:0.88;
`;


const RecText = styled(Text)`
  color:${({theme})=>theme.text.secondary};
`;


const RecView = styled(TouchableOpacity)`
  background-color: ${({theme})=>theme.background.back};
  border: 2px solid ${({theme})=>theme.background.line};
  margin-top:5px;
  border-radius:10px;
  padding:10px 10px 23px 10px;
  background-color: ${({theme,rec})=>!rec?theme.background.back:theme.background.paper};
  elevation:3;
  position:relative;
`;


const ProbText = styled(Text)`
  color:${({theme,active})=>!active?theme.text.third:theme.primary.textInside};
`;


const ProbabilityTouch = styled(TouchableOpacity)`
  justify-content: center;
  align-items: center;
  height: 40px;
  flex: 1;
  margin-right: ${({last})=>last?0:'5px'}; 
  border: 1px solid ${({theme})=>theme.background.line};
  background-color: ${({theme,active})=>!active?theme.background.paper:theme.primary.lighter};
  border-radius:6px;
  elevation:2;
`;

const Checkbox = styled(View)`
  height: 20px;
  width: 20px;
  border: 1px solid ${({theme})=>theme.background.line};
  background-color: ${({theme,active})=>!active?theme.background.paper:theme.primary.lighter};
  border-radius:20px;
  elevation:2;
`;

const ExpoTouch = styled(ProbabilityTouch)`
  max-height: 40px;
  margin-right: 0; 
  min-height: 40px;
  margin-Bottom: 7px; 
`;

const ButtonOk = styled(TouchableOpacity)`
  background-color: ${({theme})=>theme.status.success};
  justify-content: center;
  align-items: center;
  margin-top: 7px;  
  flex:1;
  padding: 4px 10px;
  border-radius:5px;

  ${props => props.disable && css`
    background-color: ${({theme})=> theme.status.inactive};
  `}
`;

const ButtonCancel = styled(ButtonOk)`
  background-color: transparent;
  border: ${({theme})=> theme.status.inactive};
  justify-content: center;
  align-items: center;
  margin-right:10px;
`;

const TextOk = styled(Text)`
  color: ${({theme,warn})=> theme.status.text};
`;

const TextCancel = styled(TextOk)`
  color: ${({theme})=>theme.text.third};
`;

const ContainerButtons = styled(View)`
  flex-direction: row;
  justify-content: flex-end;
`;

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

export default function Card({title,children,navigation, ...restProps }) {
  const themeContext = useContext(ThemeContext);
  return (
        <ContainerSafe {...restProps}>
          <StatusBar backgroundColor={themeContext.background.card} barStyle="dark-content"/>
          <Header text={title} type="Close" secondScreenName={'CardSummary'} navigation={navigation} secondIcon /* iconProps={{color:themeContext.primary.lighter}}  */secondIconProps={{color:themeContext.primary.lighter}}/>
          <View style={{height:(windowHeight-60),width:'100%'}}>
            {children}
          </View>
        </ContainerSafe>
    );
}

function CardBottomButton({sheetRef,data,activeIndex}) {

  const answers = useSelector(state => state.answer);

  const onOpenSheet = () => {
    sheetRef.current.snapTo(1)
    //console.log('index',answers[answers.findIndex(i=>i.questionId==data[activeIndex].id)])
  }

  return (
      <ButtonAnimated
        //secondary={secondary}
        secondary={false}
        //style={{backgroundColor:animatedInitialButton,marginHorizontal:20}}
        style={{marginHorizontal:20}}
        //textStyle={{fontWeight:'bold'}}
        //onPress={()=>onConfirmed()}
        onPress={onOpenSheet}
        scale={windowHeight/1000}
        elevation={true}
        text='Fatores de risco'
        //disabled={!secondary}
      />
    );
}

Card.Component = function ComponentCard({onDeletePhotoFromStorage,onAddPhotoToStorage,CheckListData,dispatch,CHECK_LIST_MODEL=[],route,sheetRef}) {
  
    const [secondary, setSecondary] = useState(false);
    const [backCardGroup, setBackCardGroup] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const [previewIndex, setPreviewIndex] = useState(0)
    const [_id, setId] = useState(CheckListData.data[0].id);

    const _key = CheckListData.data.findIndex(i=>i.id==_id)
    const data = CheckListData.data[_key].questions.filter(i=>!(i?.hide&&i.hide))
    const group = CheckListData.data[_key].group
    const groupId = CheckListData.data[_key].id ?? _id

    const CARD_WIDTH =windowWidth*0.85
    const CARD_HEIGHT =(windowHeight-70)*0.85;
    const CONTROLLER_HEIGHT =(windowHeight-70)*0.15;
    const VISIBLE_ITEMS =1;

    const themeContext = useContext(ThemeContext);
    const reactModal = useReactModal();

    const animatedValue = useRef(new AnimatedReact.Value(0)).current
    const reactiveAnimated = useRef(new AnimatedReact.Value(0)).current
    // const animatedButton = useRef(new AnimatedReact.Value(0)).current;

    useEffect(() => {
      AnimatedReact.timing(animatedValue, {
        toValue:reactiveAnimated,
        duration:300,
        useNativeDriver:true
        }).start();
    }, [])

    useEffect(() => {
      //console.log(route.params);
      if (route.params?.groupId && route.params?.cardIndex >= 0) {
        setId(route.params.groupId)
        setactiveSlide(route.params.cardIndex)
      } else if (route.params?.groupId)  {
        setId(route.params.groupId)
        setactiveSlide(0)
      }
    }, [route])

    // useEffect(() => {
    //   if(data[activeIndex]?.selected && (data[activeIndex].selected === 'yes' || data[activeIndex].selected === 'na' || data[activeIndex].selected === 'no')) onAnimatedButton(1)
    //   else onAnimatedButton(0)
    // }, [CheckListData,activeIndex,_id])

    useEffect(() => {
      console.log(backCardGroup);
    }, [backCardGroup])

    const setactiveSlide = (newIndex) => {
        setActiveIndex(newIndex);
        reactiveAnimated.setValue(newIndex)
        setPreviewIndex(activeIndex)
        if (activeIndex == data.length-1) {
          if (!backCardGroup) setBackCardGroup(true)
        }
        if (backCardGroup) setBackCardGroup(false)
    }


    const onOpenSheet = () => {
      sheetRef.current.snapTo(1)
      dispatch({type: 'ADD_RISK_ANSWER_POSITION',payload:data[activeIndex]})
      console.log('index',data[activeIndex].action.q_1.data)
      //console.log('index',answers[answers.findIndex(i=>i.questionId==data[activeIndex].id)])
    }

    // const onConfirmed = () => {
    //   if(data[activeIndex]?.selected && (data[activeIndex].selected === 'yes' || data[activeIndex].selected === 'na' || data[activeIndex].selected === 'no')) {
    //     dispatch({type: 'ANSWER_CONFIRM',payload:{itemId:data[activeIndex].id,groupId}})
    //   } else reactModal.animated({text:'Selecione uma resposta para confirmar.'})
    // };

    // const animatedInitialButton = animatedButton.interpolate({
    //   inputRange:[0,1],
    //   outputRange:[themeContext.status.inactive,themeContext.primary.lighter]
    // })

    // function onAnimatedButton(toValue) {
    //   if(toValue == 1) setSecondary(true)
    //   if(toValue == 0) setSecondary(false)
    //   AnimatedReact.timing(animatedButton, {
    //       toValue,
    //       duration: 600,
    //       useNativeDriver: false,
    //   }).start();
    // }

    function FlingGesture({children}) {
      return (
        <FlingGestureHandler key='LEFT' direction={Directions.LEFT} onHandlerStateChange={ev=>{
          if (ev.nativeEvent.state === State.END) {
            if (activeIndex === data.length) {
                return;
            } else {
              setactiveSlide(activeIndex+1)
            }
          }
        }}>
          <FlingGestureHandler key='RIGHT' direction={Directions.RIGHT} onHandlerStateChange={ev=>{
              if (ev.nativeEvent.state === State.END) {
              if (activeIndex === 0) {
                return;
              }
              setactiveSlide(activeIndex-1)
            }
          }} >
            {children}
          </FlingGestureHandler>
        </FlingGestureHandler> 
      )
    }

    return (
      <FlingGesture>
        <Container >
          {backCardGroup &&
            <BackGroupView animation="fadeIn" duration={1000} style={{height:CARD_HEIGHT+23}}>
              <BackCard setId={setId} setactiveSlide={setactiveSlide} groupIndex={_key} data={CheckListData.data}/>
            </BackGroupView>
          }
        
          <CardContainer onDeletePhotoFromStorage={onDeletePhotoFromStorage} onAddPhotoToStorage={onAddPhotoToStorage} sheetRef={sheetRef} group={group} groupId={groupId} CARD_WIDTH={CARD_WIDTH} previewIndex={previewIndex} data={data} CARD_HEIGHT={CARD_HEIGHT} activeIndex={activeIndex} dispatch={dispatch} CHECK_LIST_MODEL={CHECK_LIST_MODEL} animatedValue={animatedValue} VISIBLE_ITEMS={VISIBLE_ITEMS}  />

          <View style={{height:CONTROLLER_HEIGHT,width:'100%',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
            <TouchableHighlight activeOpacity={0.5} underlayColor={themeContext.background.hover} style={{zIndex:1000,padding:9,borderRadius:30}} onLongPress={() => {setactiveSlide(0)}} onPress={() => {if (activeIndex!== 0) setactiveSlide(activeIndex-1)}}>
                <Icons  name={'ArrowLeft'} size={25*windowHeight/1000+8.0} color={themeContext.text.third} />
            </TouchableHighlight>
            <ButtonAnimated
              //secondary={secondary}
              secondary={false}
              //style={{backgroundColor:animatedInitialButton,marginHorizontal:20}}
              style={{marginHorizontal:20}}
              //textStyle={{fontWeight:'bold'}}
              //onPress={()=>onConfirmed()}
              onPress={onOpenSheet}
              scale={windowHeight/1000}
              elevation={true}
              text='Fatores de risco'
              //disabled={!secondary}
            />
            <TouchableHighlight activeOpacity={0.5} underlayColor={themeContext.background.hover} style={{zIndex:1000,padding:9,borderRadius:30}} onLongPress={() => {setactiveSlide(data.length-1)}} onPress={() => {if (activeIndex < data.length) setactiveSlide(activeIndex+1)}}>
                <Icons  name={'ArrowRight'} size={25*windowHeight/1000+8.0} color={themeContext.text.third} />
            </TouchableHighlight>
          </View>
        </Container>
      </FlingGesture>
    );
}

export function Modal(fator,item,onClose,answers,riskPosition,dispatch,callBack,notDispatch,RiskAnswer) {

  const [active, setActive] = useState(item?.prob?item.prob:0)
  const [expo, setExpo] = useState(item?.exp?item.exp:0)
  const [primary, setPrimary] = useState(item?.primary?item.primary:false)

  function onConfirm() {
    if (!notDispatch) dispatch({type: 'CHOOSE_RISK_ANSWER',payload:{item,data:{exp:expo,prob:active,primary},answer:answers[answers.findIndex(i=>i.questionId==riskPosition.position.id)]}})
    onClose()
    if (callBack) callBack({item,data:{exp:expo,prob:active,primary},answer:answers})
  }

  return (
    <View style={{}}>
      <Text style={{fontWeight:'bold',marginBottom:12,width:windowWidth*0.8,maxWidth:400}}>{fator}</Text>
      <ProbText style={{marginBottom:8}}>Exposião</ProbText>
      <ExpoTouch activeOpacity={0.7} onPress={()=>setExpo('o')} active={'o' == expo} >
        <ProbText adjustsFontSizeToFit numberOfLines={1} active={'o' == expo}>Ocasional</ProbText>
      </ExpoTouch>
      <ExpoTouch activeOpacity={0.7} onPress={()=>setExpo('hp')} active={'hp' == expo} >
        <ProbText adjustsFontSizeToFit numberOfLines={1} active={'hp' == expo}>Habitual/Permanente</ProbText>
      </ExpoTouch>
      <ExpoTouch activeOpacity={0.7} onPress={()=>setExpo('hi')} active={'hi' == expo} >
        <ProbText adjustsFontSizeToFit numberOfLines={1} active={'hi' == expo}>Habitual/Intermitente</ProbText>
      </ExpoTouch>
      <View style={{flexDirection:'row',marginBottom:10,marginTop:10}}>
        <ProbText >Marcar se exposição primária</ProbText>
        <TouchableOpacity style={{flex:1,alignItems:'flex-end'}} activeOpacity={0.7} onPress={()=>setPrimary(primary=>!primary)}>
          <Checkbox active={primary}/>
        </TouchableOpacity>
      </View>
      <ProbText style={{marginTop:10,marginBottom:8}}>Probabilidade</ProbText>
      <View style={{flexDirection:'row',marginBottom:10}}>
        {[1,2,3,4,5].map(i=>
          <ProbabilityTouch key={i} activeOpacity={0.7} onPress={()=>setActive(i)} active={i == active} last={i == 5} >
            <ProbText active={i == active}>{i}</ProbText>
          </ProbabilityTouch>
        )}
      </View>
      <ContainerButtons style={{marginTop:20,marginBottom:0}}>
        <ButtonCancel activeOpacity={0.5} onPress={onClose}>
            <TextCancel>Calcelar</TextCancel>
        </ButtonCancel>
        <ButtonOk disabled={Boolean(active==0 || expo==0)} disable={active==0 || expo==0} activeOpacity={0.7} onPress={()=>onConfirm()} >
            <TextOk>Adicionar</TextOk>
        </ButtonOk>
      </ContainerButtons>
    </View>
  )
}

Card.BottomSheet = function Sheet({sheetRef,dispatch,checklist,children}) {

  let fall = useRef(new Animated.Value(1)).current;
  
  const themeContext = useContext(ThemeContext);
  const reactModal = useReactModal();
  const riskAnswer = useSelector(state => state.riskAnswer);
  const answers = useSelector(state => state.answer);
  const risk = useSelector(state => state.risk);
  const riskData = useSelector(state => state.riskData);
  const riskPosition = useSelector(state => state.riskPosition);
  const [riskID, setRiskID] = useState(false)
  
  // aqui me da o valor de ex:'q_1'
  //erro aqui
  const selectedAnswer = answers[answers.findIndex(i=>i.questionId==riskPosition.position.id)] ? answers[answers.findIndex(i=>i.questionId==riskPosition.position.id)].selected : null

  function onChooseRisk(fator,item) {
    reactModal.alert({
      confirmButton:'Adicionar',
      optionHide:true,
      children:(onConfirm,onClose)=>Modal(fator,item,onClose,answers,riskPosition,dispatch),
      onConfirm:()=>{},
    })
  }

  function onChooseRiskData(item,riskId) {
    dispatch({type: 'CHOOSE_RISK_ANSWER_DATA',payload:{dataId:item.id,riskId}})
  }
  function onRemoveRiskData(item,riskId) {
    dispatch({type: 'REMOVE_RISK_ANSWER_DATA',payload:{dataId:item.id,riskId}})
  }

  function riskParent() {
  //console.log('teste',[{id:1},{id:2},{id:1}].filter((item, i) => [{id:1},{id:2},{id:1}].findIndex(i=>i.id==item.id) === i))
    const returnedData = []
    if (riskPosition.parent && riskPosition.parent[riskPosition.position.id])  {
      riskPosition.parent[riskPosition.position.id].map(position=>{
        const categoryIndex =  checklist.data.findIndex(i=>i.id==position.groupId)
        const questionIndex =  checklist.data[categoryIndex].questions.findIndex(i=>i.id==position.questionId)
        returnedData.push(...checklist.data[categoryIndex].questions[questionIndex].action[position.selected].data.filter(i=>Object.keys(riskAnswer.risks).includes(i.risk)))
      })
    }

    if (selectedAnswer && riskPosition.position && riskPosition.position?.action && riskPosition.position.action[selectedAnswer] && riskPosition.position.action[selectedAnswer].data) {
      returnedData.push(...riskPosition.position.action[selectedAnswer].data.filter(i=>Object.keys(riskAnswer.risks).includes(i.risk)))
    }
    
    return [...returnedData.filter((item, i) => returnedData.findIndex(i=>i.risk==item.risk) === i)]
  }

  function riskParentSuggest() {
    //console.log('teste',[{id:1},{id:2},{id:1}].filter((item, i) => [{id:1},{id:2},{id:1}].findIndex(i=>i.id==item.id) === i))
      const returnedData = []
      console.log('riskPosition.parent',riskPosition.parent)
      if (riskPosition.parent) console.log('riskPosition.parent[riskPosition.position.id]',riskPosition.parent[riskPosition.position.id])

      if (riskPosition.parent && riskPosition.parent[riskPosition.position.id])  {
        riskPosition.parent[riskPosition.position.id].map(position=>{
          const categoryIndex =  checklist.data.findIndex(i=>i.id==position.groupId)
          const questionIndex =  checklist.data[categoryIndex].questions.findIndex(i=>i.id==position.questionId)
          returnedData.push(...checklist.data[categoryIndex].questions[questionIndex].action[position.selected].data.filter(i=>!Object.keys(riskAnswer.risks).includes(i.risk)))
        })
      }
  
      if (selectedAnswer && riskPosition.position && riskPosition.position?.action && riskPosition.position.action[selectedAnswer] && riskPosition.position.action[selectedAnswer].data) {
        returnedData.push(...riskPosition.position.action[selectedAnswer].data.filter(i=>!Object.keys(riskAnswer.risks).includes(i.risk)))
      }
      
      return [...returnedData.filter((item, i) => returnedData.findIndex(i=>i.risk==item.risk) === i)]
  }

  const renderContent = () => {
    return (
      <SheetBody >
        {riskParent().map((item,index)=>{
          if (!risk[item.risk]) return
          return(
            <View style={{marginBottom:index+1 == riskParent().length? 25:15}} key={item.risk}>
              {index == 0 && <TitleText>Fatorres de Risco Selecionados</TitleText>}
              <RiskComponent onLongPress={()=>console.log(riskData)} onPress={()=>setRiskID(riskID?false:item.risk)} key={item} text={risk[item.risk]?.name} type={risk[item.risk]?.type}>
                {riskID == item.risk && ['font','rec','med'].map((type)=>{
                  return ( 
                    <View key={type}>
                      {riskAnswer.risks[item.risk].data.filter(i=>i.type == type).map((itemSel,indexSel)=>{
                        return (
                          <View key={itemSel.id}>
                            {indexSel == 0 && 
                              <>
                                <TitleRecText >
                                  {`${type == 'rec'?'Recomendações':type == 'med'?'Medidas de Controle':'Fontes Geradoras'}`}
                                </TitleRecText>
                                <TitleRecText sub>
                                  Ativas
                                </TitleRecText>
                              </>
                            }
                            <RecView onPress={()=>onRemoveRiskData(itemSel,item.risk)} rec activeOpacity={0.8}>
                              <RecText >{riskData[itemSel.id].text}</RecText>
                              <IconsPlusMinus  name={'PlusStroke'} size={16} color={themeContext.text.third} />
                            </RecView>
                          </View>
                      )})}
                      {riskAnswer.risks[item.risk].data.filter(i=>i.type == type).length == 0 ?
                        <>
                          <TitleRecText >
                            {`${type == 'rec'?'Recomendações':type == 'med'?'Medidas de Controle':'Fontes Geradoras'}`}
                          </TitleRecText>
                          <AddRecComponent text={`Adicionar ${type == 'rec'?'Recomendação':type == 'med'?'Medida de Controle':'Fonte Geradora'}`} />
                        </>
                        :
                        <AddRecComponent style={{marginTop:18}} text={`Adicionar ${type == 'rec'?'Recomendação':type == 'med'?'Medida de Controle':'Fonte Geradora'}`} />
                      }
                      {riskAnswer.risks[item.risk].suggest.filter(i=>i.type == type).map((itemSug,indexSug)=>{
                        return (
                          <View key={itemSug.id}>
                            {indexSug == 0 && 
                              <TitleRecText sub>
                                Sugestões
                              </TitleRecText>
                            }
                            <RecView onPress={()=>onChooseRiskData(itemSug,item.risk)} activeOpacity={0.8}>
                              <RecText>{riskData[itemSug.id].text}</RecText>
                              <IconsPlusMinus  name={'MinusStroke'} size={17} color={themeContext.text.third} />
                            </RecView>
                          </View>
                      )})}
                    </View>
                  )
                })}
              </RiskComponent>

            </View>
          );
        })}
        <TitleText>Sugestões de Fatorres de Risco</TitleText>
        {riskParentSuggest().map((item,index)=>{
          if (!risk[item.risk]) return
          return(
            <View key={item.risk}>
              <RiskComponent onPress={()=>onChooseRisk(risk[item.risk]?.name,item)} text={risk[item.risk]?.name} type={risk[item.risk]?.type} />
            </View>
          );
        })}
        {(selectedAnswer && riskPosition.position && riskPosition.position?.action && riskPosition.position.action[selectedAnswer] && riskPosition.position.action[selectedAnswer].data && riskPosition.position.action[selectedAnswer]
        .data.filter(i=>!Object.keys(riskAnswer.risks).includes(i.risk)).length != 0 ) || (riskPosition.parent && riskPosition.parent[riskPosition.position.id] && riskPosition.parent[riskPosition.position.id] != 0) ? null :
          <NoRiskComponent style={{marginTop:15}}/>
        }
        {!selectedAnswer && (riskPosition.parent && riskPosition.parent[riskPosition.position.id] && riskPosition.parent[riskPosition.position.id] == 0) &&
          <NoRiskComponent text={'Selecione uma resposta para visualizar os fatores de risco'} style={{marginTop:15}}/>
        }


        
        <View style={{flex:1}}/>

        <ButtonInitial
          secondary={false}
          textStyle={{color:themeContext.text.third}}
          style={{marginTop:35,marginBottom:5}}
          /* onPress={onTakePhoto} */
          scale={0.80}
          elevation={true}
          text='Adicionar Outro'
        />
      </SheetBody>
    )
  };

  const renderHeader = () => (
    <SheetHeader >
      <SheetHeaderCont >
        {/* <TouchableHighlight activeOpacity={0.5} onPress={()=>{}} underlayColor={themeContext.background.hover} style={{zIndex:1000,padding:2,borderRadius:30}} >
            <View style={{flexDirection:'row'}}>
              <Icons  name={'ArrowLeft'} size={20} color={themeContext.text.third} />
              <TitleText style={{fontSize:13,marginBottom:0,marginRight:5}}>Medid.</TitleText>
            </View>
        </TouchableHighlight> */}
        <SheetHandle  />
        {/* <TouchableHighlight activeOpacity={0.5} onPress={()=>{}} underlayColor={themeContext.background.hover} style={{zIndex:1000,padding:2,borderRadius:30}} >
            <View style={{flexDirection:'row'}}>
              <TitleText style={{fontSize:13,marginBottom:0,marginLeft:5}}>Recom.</TitleText>
              <Icons  name={'ArrowRight'} size={20} color={themeContext.text.third} />
            </View>
        </TouchableHighlight> */}
      </SheetHeaderCont>
    </SheetHeader>
  );

  const RenderShadow = () => {
    const animatedShadowOpacity = Animated.interpolate(fall, {
      inputRange: [0, 1],
      outputRange: [0.5, 0],
    })

    return (
      <Animated.View
        pointerEvents="none"
        style={[
          {
            ...StyleSheet.absoluteFillObject,
            opacity: animatedShadowOpacity,
            backgroundColor: '#000',
          },
        ]}
      />
    )
  }

  return (
    <>
      <BottomSheet
        ref={sheetRef}
        snapPoints={[0, 600,400]}
        springConfig={{        
          stiffness: 25,
        }}
        callbackNode={fall}
        onCloseEnd={()=>setRiskID(false)}
        renderContent={renderContent}
        renderHeader={renderHeader}
      />
      <RenderShadow/>
    </>
  );
}
