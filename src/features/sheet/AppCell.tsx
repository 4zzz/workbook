import { useEffect, useMemo, useRef } from 'react';
import { getAppInfo } from '../../embeddedApps';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { CellLocator, sheetActions, sheetSelectors } from "./slice/sheetSlice";
import { BsExclamationTriangleFill } from 'react-icons/bs';
import styles from './CellContainer.module.scss';
import { PrepareResult } from '../../embeddedApps';

export interface AppCellProps {
  cellLoc: CellLocator
  isEdited: boolean,
  typeName: string,
  data: any,
  onDataChanged: (getData: () => any) => void,
  proof?: any,
  updateProofVerdict?: (verdict: boolean) => void,
}

const unsupportedApp = (type: string) => {
  return {
    prepare: () => 0,
    AppComponent: () => (
      <div style={{ textAlign: 'center' }}>
        <BsExclamationTriangleFill color='red' size={70} />
        <p>Unsupported app type: {type}</p>
      </div>
    )
  }
}

function AppCell({ cellLoc, isEdited, typeName, data, proof, onDataChanged, updateProofVerdict }: AppCellProps) {
  const cell = useAppSelector(sheetSelectors.cell(cellLoc.id));
  const context = useAppSelector(sheetSelectors.logicContext(cellLoc))
  const { prepare, AppComponent } = getAppInfo(typeName) || unsupportedApp(typeName);
  const prepareResult = useRef<PrepareResult | null>(null);

  useMemo(() => console.debug('App cell context changed', context), [context]);

  if (prepareResult.current === null) {
    prepareResult.current = prepare(data)
  }

  const { instance, getState } = prepareResult.current;
  const getState1 = () => getState(instance);

  const onAppStateChanged = () => {
    onDataChanged(getState1)
  }

  return (
    <div
      className={`${styles.appCell} ${styles[`${typeName}Cell`]}`}
      onDoubleClick={(e) => isEdited && e.stopPropagation()}
    >
      {!isEdited && <div className={styles.appOverlay} />}
      <div className={styles.appContainer}>
        <AppComponent
          isEdited={isEdited}
          context={context}
          proof={proof}
          updateProofVerdict={updateProofVerdict}
          instance={instance}
          onStateChange={onAppStateChanged}
        />
      </div>
    </div>
  )
}

export default AppCell;
