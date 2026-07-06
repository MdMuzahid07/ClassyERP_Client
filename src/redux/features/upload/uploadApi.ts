import { baseApi } from '../../api/baseApi';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    secure_url: string;
    public_id: string;
    format: string;
    bytes: number;
    original_filename: string;
  };
}

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation<UploadResponse['data'], FormData>({
      query: (formData) => ({
        url: '/upload/image',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: UploadResponse) => response.data,
    }),
  }),
});

export const { useUploadImageMutation } = uploadApi;
export default uploadApi;
