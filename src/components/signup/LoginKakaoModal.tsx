import Link from 'next/link';
import CloseIcon from '../icon/commonIcon/CloseIcon';
import KakaoLoginIcon from '../icon/kakaoLoginIcon.svg';

type Props = {
  closeModal: () => void;
};

export default function LoginKakaoModal({ closeModal }: Props) {
  return (
    <div className="bg-white p-4 rounded-t-2xl w-sm md:w-md m-auto absolute bottom-0 left-0 right-0">
      <div className="w-full flex items-center justify-end">
        <button onClick={closeModal}>
          <CloseIcon color="#000000" />
        </button>
      </div>
      <div className="relative my-4 flex justify-center items-center">
        <KakaoLoginIcon />
      </div>

      <div className="text-center space-y-2 py-4">
        <h2 className="text-secondary-N900 text-headLine-md font-bold leading-headLine-md">본투런과 함께 뛰어요!</h2>
        <p className="text-secondary-N90 text-body-lg font-regular leading-body-lg tracking-body-lg">
          반가워요! 본투런 회원이 되어 간편한 러닝 모임
          <br />
          관리와 러너들과의 소통을 경험해보세요!
        </p>
      </div>

      <Link
        href={`${process.env.NEXT_PUBLIC_BASE_URL}/oauth2/authorization/kakao?redirect_uri=${process.env.NEXT_PUBLIC_AUTHORIZED_REDIRECT_URL}`}
        className="mt-4 mb-[10.25rem] px-4 bg-[#FEE500] h-14 w-full flex justify-center items-center space-x-2 rounded-xl m-auto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M11.98 3.00079C6.76 3.00079 2.5 6.36079 2.5 10.5608C2.5 13.2008 4.24 15.5408 6.82 16.9208L6.1 20.6408L10.18 17.9408L11.98 18.0608C17.2 18.0608 21.46 14.7008 21.46 10.5008C21.46 6.30079 17.2 2.94079 11.98 3.00079Z"
            fill="black"
          />
        </svg>
        <span className="text-label-lg font-bold tracking-label-lg text-black ">카카오로 간편하게 시작하기</span>
      </Link>
    </div>
  );
}
