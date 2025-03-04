import jwt from 'jwt-decode';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';

import { commonApi } from '@libs/api';
import { track } from '@libs/amplitude';
import { API_KEYS } from '@config';
import { IErrorObject, ILoginResponse, SCREENS } from '@impler/shared';
import { handleRouteBasedOnScreenResponse } from '@shared/helpers';

export function useSignin() {
  const { push } = useRouter();
  const { register, handleSubmit } = useForm<ISigninData>();
  const [errorMessage, setErrorMessage] = useState<IErrorObject | undefined>(undefined);
  const { mutate: login, isLoading: isLoginLoading } = useMutation<
    ILoginResponse,
    IErrorObject,
    ISigninData,
    (string | undefined)[]
  >([API_KEYS.SIGNIN], (body) => commonApi<ILoginResponse>(API_KEYS.SIGNIN as any, { body }), {
    onSuccess: (data) => {
      if (!data) return;
      const profileData = jwt<IProfileData>(data.token as string);
      track({
        name: 'SIGNIN',
        properties: {
          email: profileData.email,
          id: profileData._id,
        },
      });
      handleRouteBasedOnScreenResponse(data.screen as SCREENS, push);
    },
    onError(error) {
      setErrorMessage(error);
    },
  });

  const onLogin = (data: ISigninData) => {
    login(data);
  };

  return {
    register,
    errorMessage,
    isLoginLoading,
    login: handleSubmit(onLogin),
  };
}
