import { useRef, useState, useEffect } from "react";
import { Checkbox, Panel, DefaultButton, TextField, SpinButton } from "@fluentui/react";
import { SparkleFilled } from "@fluentui/react-icons";

import styles from "./Chat.module.css";

import { chatApi, Approaches, AskResponse, ChatRequest, ChatTurn } from "../../api";
import { Answer, AnswerError, AnswerLoading } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { ExampleList } from "../../components/Example";
import { UserChatMessage } from "../../components/UserChatMessage";
import { AnalysisPanel, AnalysisPanelTabs } from "../../components/AnalysisPanel";
import { SettingsButton } from "../../components/SettingsButton";
import { ClearChatButton } from "../../components/ClearChatButton";

const Chat = () => {
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [promptTemplate, setPromptTemplate] = useState<string>("");
    const [retrieveCount, setRetrieveCount] = useState<number>(3);
    const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(true);
    const [useSemanticCaptions, setUseSemanticCaptions] = useState<boolean>(false);
    const [excludeCategory, setExcludeCategory] = useState<string>("");
    const [stockFilter, setStockFilter] = useState<string>("");
    const [useSuggestFollowupQuestions, setUseSuggestFollowupQuestions] = useState<boolean>(false);
    const [useOnlineData, setUseOnlineData] = useState<boolean>(true);
    const [selectedConversationStyle, setSelectedConversationStyle] = useState<string>("Balance");
    const [selectedIndex, setSelectedIndex] = useState<string>("Default");

    const lastQuestionRef = useRef<string>("");
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();

    const [activeCitation, setActiveCitation] = useState<string>();
    const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<AnalysisPanelTabs | undefined>(undefined);

    const [selectedAnswer, setSelectedAnswer] = useState<number>(0);
    const [answers, setAnswers] = useState<[user: string, response: AskResponse][]>([]);

    const makeApiRequest = async (question: string) => {
        lastQuestionRef.current = question;

        error && setError(undefined);
        setIsLoading(true);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);

        try {
            const history: ChatTurn[] = answers.map(a => ({ user: a[0], bot: a[1].answer }));
            const request: ChatRequest = {
                history: [...history, { user: question, bot: undefined }],
                approach: Approaches.ReadRetrieveRead,
                overrides: {
                    promptTemplate: promptTemplate.length === 0 ? undefined : promptTemplate,
                    excludeCategory: excludeCategory.length === 0 ? undefined : excludeCategory,
                    stockFilter: stockFilter.length === 0 ? undefined : stockFilter,
                    top: retrieveCount,
                    semanticRanker: useSemanticRanker,
                    semanticCaptions: useSemanticCaptions,
                    suggestFollowupQuestions: useSuggestFollowupQuestions,
                    conversationstyleoption: selectedConversationStyle,
                    indexoption: selectedIndex
                }
            };
            const result = await chatApi(request);
            setAnswers([...answers, [question, result]]);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        lastQuestionRef.current = "";
        error && setError(undefined);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);
        setAnswers([]);
    };

    useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [isLoading]);

    const onPromptTemplateChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setPromptTemplate(newValue || "");
    };

    const onRetrieveCountChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setRetrieveCount(parseInt(newValue || "3"));
    };

    const onUseSemanticRankerChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSemanticRanker(!!checked);
    };

    const onUseSemanticCaptionsChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSemanticCaptions(!!checked);
    };

    const onExcludeCategoryChanged = (_ev?: React.FormEvent, newValue?: string) => {
        setExcludeCategory(newValue || "");
    };

    const onStockFilterChanged = (_ev?: React.FormEvent, newValue?: string) => {
        setStockFilter(newValue || "");
    };

    const onUseSuggestFollowupQuestionsChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSuggestFollowupQuestions(!!checked);
    };

    const onUseOnlineDataChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseOnlineData(!!checked);
    };

    const radioHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedConversationStyle(event.target.value);
    };

    const indexRadioHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIndex(event.target.value);
    };

    const onExampleClicked = (example: string) => {
        makeApiRequest(example);
    };

    const onShowCitation = (citation: string, index: number) => {
        if (activeCitation === citation && activeAnalysisPanelTab === AnalysisPanelTabs.CitationTab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveCitation(citation);
            setActiveAnalysisPanelTab(AnalysisPanelTabs.CitationTab);
        }

        setSelectedAnswer(index);
    };

    const onToggleTab = (tab: AnalysisPanelTabs, index: number) => {
        if (activeAnalysisPanelTab === tab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveAnalysisPanelTab(tab);
        }

        setSelectedAnswer(index);
    };

    return (
        <div className={styles.container}>
            <div className={styles.commandsContainer}>
                <ClearChatButton className={styles.commandButton} onClick={clearChat} disabled={!lastQuestionRef.current || isLoading} />
                <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
            </div>
            <div className={styles.chatRoot}>
                <div className={styles.chatContainer}>
                    {!lastQuestionRef.current ? (
                        <div className={styles.chatEmptyState}>
                            <img src="../smartonelogo.png" height={200}></img>
                            <h1 className={styles.chatEmptyStateTitle}>GTI X SMARTONE WORKSHOP</h1>
                            <h2 className={styles.chatEmptyStateSubtitle}>Ask anything or try an example</h2>
                            <ExampleList onExampleClicked={onExampleClicked} />
                        </div>
                    ) : (
                        <div className={styles.chatMessageStream}>
                            {answers.map((answer, index) => (
                                <div key={index}>
                                    <UserChatMessage message={answer[0]} />
                                    <div className={styles.chatMessageGpt}>
                                        <Answer
                                            key={index}
                                            answer={answer[1]}
                                            isSelected={selectedAnswer === index && activeAnalysisPanelTab !== undefined}
                                            onCitationClicked={c => onShowCitation(c, index)}
                                            onThoughtProcessClicked={() => onToggleTab(AnalysisPanelTabs.ThoughtProcessTab, index)}
                                            onSupportingContentClicked={() => onToggleTab(AnalysisPanelTabs.SupportingContentTab, index)}
                                            onFollowupQuestionClicked={q => makeApiRequest(q)}
                                            showFollowupQuestions={useSuggestFollowupQuestions && answers.length - 1 === index}
                                        />
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <>
                                    <UserChatMessage message={lastQuestionRef.current} />
                                    <div className={styles.chatMessageGptMinWidth}>
                                        <AnswerLoading />
                                    </div>
                                </>
                            )}
                            {error ? (
                                <>
                                    <UserChatMessage message={lastQuestionRef.current} />
                                    <div className={styles.chatMessageGptMinWidth}>
                                        <AnswerError error={error.toString()} onRetry={() => makeApiRequest(lastQuestionRef.current)} />
                                    </div>
                                </>
                            ) : null}
                            <div ref={chatMessageStreamEnd} />
                        </div>
                    )}

                    <div className={styles.chatInput}>
                        <QuestionInput clearOnSend placeholder="Type to ask a question" disabled={isLoading} onSend={question => makeApiRequest(question)} />
                    </div>
                </div>

                {answers.length > 0 && activeAnalysisPanelTab && (
                    <AnalysisPanel
                        className={styles.chatAnalysisPanel}
                        activeCitation={activeCitation}
                        onActiveTabChanged={x => onToggleTab(x, selectedAnswer)}
                        citationHeight="810px"
                        answer={answers[selectedAnswer][1]}
                        activeTab={activeAnalysisPanelTab}
                    />
                )}

                <Panel
                    headerText="Configure answer generation"
                    isOpen={isConfigPanelOpen}
                    isBlocking={false}
                    onDismiss={() => setIsConfigPanelOpen(false)}
                    closeButtonAriaLabel="Close"
                    onRenderFooterContent={() => <DefaultButton onClick={() => setIsConfigPanelOpen(false)}>Close</DefaultButton>}
                    isFooterAtBottom={true}
                >
                    <TextField
                        className={styles.chatSettingsSeparator}
                        defaultValue={promptTemplate}
                        label="Override prompt template"
                        multiline
                        autoAdjustHeight
                        onChange={onPromptTemplateChange}
                    />

                    <SpinButton
                        className={styles.chatSettingsSeparator}
                        label="Retrieve this many documents from search:"
                        min={1}
                        max={50}
                        defaultValue={retrieveCount.toString()}
                        onChange={onRetrieveCountChange}
                    />
                    <TextField className={styles.chatSettingsSeparator} label="Exclude category" onChange={onExcludeCategoryChanged} />
                    {/* <TextField className={styles.chatSettingsSeparator} label="Stock filter" onChange={onStockFilterChanged} /> */}
                    <Checkbox
                        className={styles.chatSettingsSeparator}
                        checked={useSemanticRanker}
                        label="Use semantic ranker for retrieval"
                        onChange={onUseSemanticRankerChange}
                    />
                    <Checkbox
                        className={styles.chatSettingsSeparator}
                        checked={useSemanticCaptions}
                        label="Use query-contextual summaries instead of whole documents"
                        onChange={onUseSemanticCaptionsChange}
                        disabled={!useSemanticRanker}
                    />
                    <Checkbox
                        className={styles.chatSettingsSeparator}
                        checked={useSuggestFollowupQuestions}
                        label="Suggest follow-up questions"
                        onChange={onUseSuggestFollowupQuestionsChange}
                    />
                    {/* <Checkbox className={styles.chatSettingsSeparator} checked={useOnlineData} label="Use online data" onChange={onUseOnlineDataChange} /> */}
                    <div className="container">
                        <fieldset>
                            <legend>Please select your conversation style</legend>
                            <p>
                                <input
                                    type="radio"
                                    name="conversation style"
                                    value="Creative"
                                    id="creative"
                                    onChange={radioHandler}
                                    checked={selectedConversationStyle == "Creative"}
                                />
                                <label htmlFor="csop">More Creative</label>
                            </p>
                            <p>
                                <input
                                    type="radio"
                                    name="conversation style"
                                    value="Balance"
                                    id="balance"
                                    onChange={radioHandler}
                                    checked={selectedConversationStyle == "Balance"}
                                />
                                <label htmlFor="gammon">More Balance</label>
                            </p>
                            <p>
                                <input
                                    type="radio"
                                    name="conversation style"
                                    value="Precise"
                                    id="precise"
                                    onChange={radioHandler}
                                    checked={selectedConversationStyle == "Precise"}
                                />
                                <label htmlFor="gammon">More Precise</label>
                            </p>
                        </fieldset>
                    </div>
                    <div className="container">
                        <fieldset>
                            <legend>Please select index of your group</legend>
                            <p>
                                <input
                                    type="radio"
                                    name="index"
                                    value="Group 1"
                                    id="group1"
                                    onChange={indexRadioHandler}
                                    checked={selectedIndex == "Group 1"}
                                />
                                <label htmlFor="Group 1">Group 1</label>
                            </p>
                            <p>
                                <input
                                    type="radio"
                                    name="index"
                                    value="Group 2"
                                    id="group2"
                                    onChange={indexRadioHandler}
                                    checked={selectedIndex == "Group 2"}
                                />
                                <label htmlFor="Group 2">Group 2</label>
                            </p>
                            <p>
                                <input
                                    type="radio"
                                    name="index"
                                    value="Group 3"
                                    id="group3"
                                    onChange={indexRadioHandler}
                                    checked={selectedIndex == "Group 3"}
                                />
                                <label htmlFor="Group 3">Group 3</label>
                            </p>
                            <p>
                                <input
                                    type="radio"
                                    name="index"
                                    value="Group 4"
                                    id="group4"
                                    onChange={indexRadioHandler}
                                    checked={selectedIndex == "Group 4"}
                                />
                                <label htmlFor="Group 4">Group 4</label>
                            </p>
                            <p>
                                <input
                                    type="radio"
                                    name="index"
                                    value="Group 5"
                                    id="group5"
                                    onChange={indexRadioHandler}
                                    checked={selectedIndex == "Group 5"}
                                />
                                <label htmlFor="Group 5">Group 5</label>
                            </p>
                            <p>
                                <input
                                    type="radio"
                                    name="index"
                                    value="Default"
                                    id="default"
                                    onChange={indexRadioHandler}
                                    checked={selectedIndex == "Default"}
                                />
                                <label htmlFor="Default">Default</label>
                            </p>
                            {/* <p>
                                <input type="radio" name="index" value="Test" id="test" onChange={indexRadioHandler} checked={selectedIndex == "Test"} />
                                <label htmlFor="Test">Test</label>
                            </p> */}
                        </fieldset>
                    </div>
                </Panel>
            </div>
        </div>
    );
};

export default Chat;
