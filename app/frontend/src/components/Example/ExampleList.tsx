import { Example } from "./Example";

import styles from "./Example.module.css";

export type ExampleModel = {
    text: string;
    value: string;
};

const EXAMPLES: ExampleModel[] = [
    {
        text: "What is the maximum speed offered for the 20GB Data Plan?",
        value: "What is the maximum speed offered for the 20GB Data Plan?"
    },
    {
        text: "What is the monthly pricing for the 21Mbps 20GB Data Plan?",
        value: "What is the monthly pricing for the 21Mbps 20GB Data Plan?"
    },
    {
        text: "How can customers subscribe to the 'care free all you can talk' service?",
        value: "How can customers subscribe to the 'care free all you can talk' service?"
    }
];

interface Props {
    onExampleClicked: (value: string) => void;
}

export const ExampleList = ({ onExampleClicked }: Props) => {
    return (
        <ul className={styles.examplesNavList}>
            {EXAMPLES.map((x, i) => (
                <li key={i}>
                    <Example text={x.text} value={x.value} onClick={onExampleClicked} />
                </li>
            ))}
        </ul>
    );
};
