'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/queries/useAuth';
import { useModal } from '@/hooks/useModal';
import { useLoginStateStore } from '@/store/useLoginStateStore';

import SignUpUserName from './SignUpUserName';
import SignUpCrewName from './SignUpCrewName';
import SignUpInstaId from './SignUpInstaId';
import SolidButton from '@/components/common/commonButton/SolidButton';
import ErrorModal from '@/components/modal/ErrorModal';

export type SignUpForm = {
  userName: string;
  crew: string;
  instaId?: string;
};

export default function SignUpForm() {
  console.log('signup form');
  const modal = useModal();

  const formMethods = useForm<SignUpForm>();
  const router = useRouter();
  const {
    getCrewListQuery: { data: crewList, isError: isCrewListError },
  } = useAuth();

  const onSignUpError = () => {
    modal.show();
  };

  const { signUp } = useAuth(null, { onError: onSignUpError });
  const { loginState } = useLoginStateStore();

  const formErrors = formMethods.formState.errors;

  useEffect(() => {
    if (isCrewListError) modal.show();
  }, [isCrewListError, modal]);

  const onSubmit = useCallback(
    (data: SignUpForm) => {
      const { crew, userName, instaId } = data;
      const crewId = crewList?.crews.find((item) => item.crewName === crew)?.crewId;
      if (!crewId || !userName) return;

      signUp.mutate({
        crewId: Number(crewId),
        userName,
        ...(instaId && { instagramId: instaId }),
      });
    },
    [crewList?.crews, signUp]
  );

  const isCrewNameError =
    !!formErrors.crew?.type || formMethods.getValues('crew') === '' || !formMethods.getValues('crew');
  const isUserNameError = !!formErrors.userName?.type || !formMethods.getValues('userName');
  const isIstaError = !!formErrors.instaId?.type;

  const buttonDisabled = isCrewNameError || isUserNameError || isIstaError;

  return (
    <div>
      {isCrewListError && (
        <ErrorModal
          isActive={modal.isVisible}
          isHome
          backHomeText="네트워크 장애가 발생하였습니다."
          closeModal={modal.hide}
        />
      )}
      {signUp.isError ? (
        <ErrorModal isHome isActive={modal.isVisible} backHomeText="회원가입 실패하였습니다." closeModal={modal.hide} />
      ) : (
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-6 ">
            <SignUpUserName />
            <SignUpCrewName crewList={crewList} />
            <SignUpInstaId />

            <div className="absolute bottom-4 m-auto left-0 right-0">
              <SolidButton
                title="가입 완료"
                type="submit"
                disabled={buttonDisabled}
                height={'h-[3.5rem]'}
                isLoading={signUp.isPending}
              />
            </div>
          </form>
        </FormProvider>
      )}
    </div>
  );
}
